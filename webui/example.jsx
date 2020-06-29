import React, { useState, useCallback, useMemo, useEffect, useRef } from "react"

import uuid from "uuid/v4"

import { useDebounce } from "use-debounce"

import { Store } from "n3"
import { Dataset } from "rdf-cytoscape"

import { cid, serialize } from "ipld-dag-cbor/src/util.js"

import { parseJsonLd } from "./parse.js"

export default function Example(props) {
	const id = useRef(null)
	const [error, setError] = useState(null)
	const [reduced, setReduced] = useState(null)
	const [assertions, setAssertions] = useState(props.assertions)

	useEffect(() => {
		const onMessage = ({ data }) => {
			if (data.id !== id.current) {
				return
			} else if (Array.isArray(data.result)) {
				setReduced(new Store(data.result))
				setError(null)
			} else if (data.error && typeof data.error === "string") {
				setError(data.error)
			}
		}
		props.worker.addEventListener("message", onMessage)
		return () => props.worker.removeEventListener("message", onMessage)
	}, [])

	const [value, setValue] = useState(props.shex)
	const handleChange = useCallback((event) => setValue(event.target.value), [])

	const [shex] = useDebounce(value, 500)
	useEffect(() => {
		if (Array.isArray(props.assertions) && props.assertions.length > 0) {
			const assertions = props.assertions.map(({ dataset }) => dataset)
			id.current = uuid()
			props.worker.postMessage({ id: id.current, shex, assertions })
		}
	}, [shex])

	const handleUpload = useCallback(
		async (event) => {
			const newAssertions = []
			for (const file of event.target.files) {
				const doc = await file.text().then((text) => JSON.parse(text))
				const dataset = await parseJsonLd(doc, null)
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
