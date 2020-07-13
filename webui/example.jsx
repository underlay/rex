import React, { useState, useCallback, useMemo, useEffect, useRef } from "react"

import { useDebounce } from "use-debounce"

import { Store } from "n3"
import { Dataset } from "rdf-cytoscape"

import { parseJsonLd } from "./parse.js"
import { loadText } from "../lib/loader.js"
import { materialize } from "../lib/type.js"
import { Schema } from "../lib/schema.js"

const reduceContext = ([_, path], { key, type: { name } }) => [
	name,
	path + "/" + key,
]

const options = {
	algorithm: "URDNA2015",
	format: "application/n-quads",
}

export default function Example(props) {
	// const id = useRef(null)
	const [error, setError] = useState(null)
	const [reduced, setReduced] = useState(null)
	const [assertions, setAssertions] = useState([])
	const [example, setExample] = useState(props.initialExample)
	const [schema, setSchema] = useState(null)

	useEffect(() => {
		const names = props.examples.get(example)
		Promise.all([
			fetch(`examples/${example}/schema.shex`).then((res) => res.text()),
			...names.map((name) =>
				fetch(`examples/${example}/${name}`).then((res) => res.json())
			),
		]).then(([shex, ...docs]) =>
			Promise.all(docs.map((doc) => parseJsonLd(doc, null))).then(
				(datasets) => {
					setValue(shex)
					setAssertions(datasets)
				}
			)
		)
	}, [example])

	const [value, setValue] = useState("")
	const handleChange = useCallback((event) => setValue(event.target.value), [])

	const [shex] = useDebounce(value, 1000)
	useEffect(() => {
		if (shex === "") {
			if (schema !== null) {
				setSchema(null)
			}

			if (reduced !== null) {
				setReduced(null)
			}

			if (error !== null) {
				setError(null)
			}

			return
		}

		loadText(shex, null)
			.then((schema) => {
				const result = Schema.decode(schema)
				if (result._tag === "Left") {
					const { context, message } = result.left.pop()
					const [name, path] = context.reduce(reduceContext, ["", ""])
					let err = `${path}: ${name}`
					if (err.startsWith("//")) {
						err = err.slice(1)
					}
					if (message !== undefined) {
						err += `\n${message}`
					}
					setSchema(null)
					setReduced(null)
					setError(err)
				} else {
					setSchema(result.right)
					setError(null)
				}
			})
			.catch((err) => setError(err.toString()))
	}, [shex])

	useEffect(() => {
		if (schema !== null && assertions.length > 0) {
			const datasets = assertions.map(({ dataset }) => dataset)
			const view = materialize(schema, datasets)
			setReduced(new Store(view))
		}
	}, [schema, assertions])

	const handleUpload = useCallback(
		async (event) => {
			const newAssertions = []
			for (const file of event.target.files) {
				const doc = await file.text().then((text) => JSON.parse(text))
				const dataset = await parseJsonLd(doc, null)
				newAssertions.push(dataset)
			}
			setAssertions(newAssertions.concat(assertions))
		},
		[assertions]
	)

	const handleRemove = useCallback(
		(cid) => {
			const i = assertions.findIndex((assertion) => assertion.cid === cid)
			if (i !== -1) {
				if (assertions.length === 1) {
					setAssertions([])
					setReduced(null)
				} else {
					setAssertions([...assertions.slice(0, i), ...assertions.slice(i + 1)])
				}
			}
		},
		[assertions]
	)

	return (
		<React.Fragment>
			<section className="schema">
				<header>
					<h2>Schema</h2>
					<span>
						Load example:{" "}
						{Array.from(props.examples.keys()).map((key) => (
							<button
								disabled={key === example}
								key={key}
								onClick={() => setExample(key)}
							>
								{key}
							</button>
						))}
					</span>
				</header>

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
			<section className="output">
				<h2>Reduced dataset</h2>
				<div className="pushout rdf-cytoscape">
					{error !== null ? (
						renderError(error)
					) : assertions.length === 0 ? (
						<code>No assertions</code>
					) : reduced === null ? (
						<code>loading...</code>
					) : (
						<Dataset store={reduced} focus={undefined} />
					)}
				</div>
			</section>
		</React.Fragment>
	)
}

function Assertion({ cid, dataset, onRemove }) {
	const handleRemove = useCallback((_) => onRemove(cid), [cid, onRemove])

	const [open, setOpen] = useState(false)
	const handleChange = useCallback((event) => setOpen(event.target.checked), [])

	const store = useMemo(() => new Store(dataset), [dataset])

	return (
		<div className="assertion">
			<pre>dweb:/ipld/{cid}</pre>
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
}

function renderError(error) {
	return (
		<div className="error">
			<code>Error parsing schema:</code>
			<pre>{error}</pre>
		</div>
	)
}
