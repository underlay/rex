import "rdf-cytoscape/rdf-cytoscape.css"

import React, { useState, useCallback, useMemo, useEffect } from "react"
import ReactDOM from "react-dom"

import { useDebounce } from "use-debounce"

import NewDwebDocumentLoader from "dweb-loader"
import IpfsHttpClient from "ipfs-http-client"
import { Store } from "n3"
import { Dataset } from "rdf-cytoscape"

import { loadText } from "../lib/loader.js"
import { parseJsonLd } from "../lib/utils.js"
import { materialize } from "../lib/materialize.js"
import { Schema } from "../lib/schema.js"

import { cid, serialize } from "ipld-dag-cbor/src/util.js"

const ipfs = IpfsHttpClient("http://localhost:5001")

const documentLoader = NewDwebDocumentLoader(ipfs)

const main = document.querySelector("main")

Promise.all([
	fetch("webui/person.shex").then((res) => res.text()),
	fetch("webui/a.jsonld").then((res) => res.json()),
	fetch("webui/b.jsonld").then((res) => res.json()),
])
	.then(async ([shex, a, b]) => {
		const A = await parseJsonLd(a, documentLoader)
		const B = await parseJsonLd(b, documentLoader)
		const props = {
			shex,
			assertions: [
				{ cid: await cid(serialize(a)), store: new Store(A) },
				{ cid: await cid(serialize(b)), store: new Store(B) },
			],
		}

		ReactDOM.render(<Index {...props} />, main)
	})
	.catch((err) => console.error(err))

function Index(props) {
	const [value, setValue] = useState(props.shex)
	const handleChange = useCallback((event) => setValue(event.target.value), [])

	const [errors, setErrors] = useState(null)
	const [schema, setSchema] = useState(null)

	const [shex] = useDebounce(value, 500)
	useEffect(() => {
		loadText(shex, ipfs)
			.then((schema) => {
				const result = Schema.decode(schema)
				if (result._tag === "Left") {
					setErrors(result.left.flatMap(({ context }) => context))
				} else {
					setSchema(result.right)
					if (errors !== null) {
						setErrors(null)
					}
				}
			})
			.catch((err) => setErrors([err]))
	}, [shex])

	const [assertions, setAssertions] = useState(props.assertions)

	const reduced = useMemo(() => {
		if (schema === null) {
			return null
		}
		const datasets = assertions.map(({ store }) => store)
		const view = materialize(schema, datasets)
		return new Store(view)
	}, [schema, assertions])

	const handleUpload = useCallback(
		async (event) => {
			const newAssertions = []
			for (const file of event.target.files) {
				const doc = await file.text().then((text) => JSON.parse(text))
				const dataset = await parseJsonLd(doc, documentLoader)
				newAssertions.push({
					cid: await cid(serialize(doc)),
					store: new Store(dataset),
				})
			}
			setAssertions(newAssertions.concat(assertions))
		},
		[assertions]
	)

	return (
		<React.Fragment>
			<section id="assertions">
				<h2>Assertions</h2>
				<label>
					<span>Upload JSON-LD assertions:</span>
					<input
						type="file"
						multiple={true}
						onChange={handleUpload}
						accept=".json,.jsonld,application/json,application/ld+json"
					/>
				</label>
				{assertions.map(({ cid, store }, i) => (
					<Assertion
						key={cid.toString()}
						cid={cid}
						store={store}
						onRemove={() =>
							setAssertions([
								...assertions.slice(0, i),
								...assertions.slice(i + 1),
							])
						}
					/>
				))}
			</section>
			<section>
				<h2>Schema</h2>
				<textarea
					value={value}
					onChange={handleChange}
					spellCheck={false}
				></textarea>
			</section>
			<section>
				<h2>Reduced pushout</h2>
				<div id="pushout" className="rdf-cytoscape">
					{reduced === null ? (
						<code>loading...</code>
					) : errors === null ? (
						<Dataset store={reduced} focus={undefined} />
					) : (
						renderError(errors)
					)}
				</div>
			</section>
		</React.Fragment>
	)
}

function Assertion({ cid, store, onRemove }) {
	const [open, setOpen] = useState(false)
	const handleChange = useCallback((event) => setOpen(event.target.checked), [])
	return (
		<div className="assertion">
			<pre>ul:{cid.toString()}</pre>
			<form>
				<label>
					Show rendered dataset
					<input type="checkbox" checked={open} onChange={handleChange} />
				</label>
				<button className="remove" onClick={onRemove}>
					Remove
				</button>
			</form>
			{open && (
				<div className="rdf-cytoscape">
					<Dataset store={store} focus={undefined} />
				</div>
			)}
		</div>
	)
}

function renderError(errors) {
	return (
		<div className="error">
			<code>Error parsing schema:</code>
			<pre>
				{errors.map((error) => JSON.stringify(error, null, "  ")).join("\n")}
			</pre>
		</div>
	)
}
