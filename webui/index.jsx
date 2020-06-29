import "rdf-cytoscape/rdf-cytoscape.css"

import React, { useState, useCallback, useMemo, useEffect, useRef } from "react"
import ReactDOM from "react-dom"

import uuid from "uuid/v4"

import { useDebounce } from "use-debounce"

import NewDwebDocumentLoader from "dweb-loader"
import IpfsHttpClient from "ipfs-http-client"
import { Store } from "n3"
import { Dataset } from "rdf-cytoscape"

import { parseJsonLd } from "../lib/utils.js"

import { cid, serialize } from "ipld-dag-cbor/src/util.js"
import { isRight, isLeft } from "fp-ts/es6/Either.js"

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
		const cidA = await cid(serialize(a))
		const cidB = await cid(serialize(b))
		const props = {
			shex,
			assertions: [
				{ cid: cidA.toString(), dataset: A },
				{ cid: cidB.toString(), dataset: B },
			],
		}

		ReactDOM.render(
			<React.Fragment>
				{/* <div className="example">
					<Index {...props} />
				</div> */}
				<div className="example">
					<Index {...props} />
				</div>
			</React.Fragment>,
			main
		)
	})
	.catch((err) => console.error(err))

function Index(props) {
	const id = useRef(null)
	const [error, setError] = useState(null)
	const [reduced, setReduced] = useState(null)
	const [assertions, setAssertions] = useState(props.assertions)

	const worker = useMemo(() => {
		const worker = new Worker("webui/lib/worker.min.js")
		worker.addEventListener("message", ({ data }) => {
			if (data.id !== id.current) {
				return
			} else if (isRight(data.result)) {
				setReduced(new Store(data.result.right))
				setError(null)
			} else if (isLeft(data.result)) {
				setError(data.result.left)
			}
		})
		return worker
	}, [])

	const [value, setValue] = useState(props.shex)
	const handleChange = useCallback((event) => setValue(event.target.value), [])

	const [shex] = useDebounce(value, 500)
	useEffect(() => {
		if (Array.isArray(props.assertions) && props.assertions.length > 0) {
			const assertions = props.assertions.map(({ dataset }) => dataset)
			id.current = uuid()
			worker.postMessage({ id: id.current, shex, assertions })
		}
	}, [shex])

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

	const handleRemove = useCallback(
		(cid) => {
			const i = assertions.findIndex((assertion) => assertion.cid === cid)
			if (i !== -1) {
				setAssertions([...assertions.slice(0, i), ...assertions.slice(i + 1)])
			}
		},
		[assertions]
	)

	return (
		<React.Fragment>
			<section className="schema">
				<h2>Schema</h2>
				<textarea
					value={value}
					onChange={handleChange}
					spellCheck={false}
				></textarea>
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
				{assertions.map(({ cid, dataset }) => (
					<Assertion
						key={cid}
						cid={cid}
						dataset={dataset}
						onRemove={handleRemove}
					/>
				))}
			</section>
			<section>
				<h2>Reduced dataset</h2>
				<div className="pushout rdf-cytoscape">
					{reduced === null ? (
						<code>loading...</code>
					) : error === null ? (
						<Dataset store={reduced} focus={undefined} />
					) : (
						renderError(error)
					)}
				</div>
			</section>
		</React.Fragment>
	)
}

const Assertion = React.memo(
	function ({ cid, dataset, onRemove }) {
		const handleRemove = useCallback((_) => onRemove(cid), [cid])

		const [open, setOpen] = useState(true)
		const handleChange = useCallback(
			(event) => setOpen(event.target.checked),
			[]
		)

		const store = useMemo(() => new Store(dataset), [dataset])

		return (
			<div className="assertion">
				<pre>ul:{cid}</pre>
				<form>
					<label>
						Show rendered dataset
						<input type="checkbox" checked={open} onChange={handleChange} />
					</label>
					<button className="remove" onClick={handleRemove}>
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
	},
	(prevProps, nextProps) => prevProps.cid === nextProps.cid
)

function renderError(error) {
	return (
		<div className="error">
			<code>Error parsing schema:</code>
			<pre>{error}</pre>
		</div>
	)
}
