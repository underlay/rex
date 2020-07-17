import React, { useState, useCallback, useEffect, useMemo } from "react"

import { Store } from "n3"
import { Dataset } from "rdf-cytoscape"

import { getCoproduct } from "../lib/pushout.js"
import { materialize, getDataset } from "../lib/materialize.js"

import { parseJsonLd } from "./parse.js"
import Assertion from "./assertion.jsx"
import Schema from "./schema.jsx"

const graphHeight = 300

export default function Example(props) {
	const [assertions, setAssertions] = useState([])
	const [example, setExample] = useState(props.initialExample)
	const [schema, setSchema] = useState(null)
	const [view, setView] = useState("table")
	const setTable = useCallback(({}) => setView("table"), [])
	const setGraph = useCallback(({}) => setView("graph"), [])
	const [viewUnion, setViewUnion] = useState(null)
	const setUnionGraph = useCallback(({}) => setViewUnion("graph"), [])
	const setUnionHide = useCallback(({}) => setViewUnion(null), [])

	const [shex, setShex] = useState("")
	useEffect(() => {
		fetch(`examples/${example}`)
			.then((res) => res.text())
			.then(setShex)
			.catch((err) => console.error(err))

		Promise.all(
			props.examples.get(example).map((name) =>
				fetch(`examples/${name}`)
					.then((res) => res.json())
					.then((doc) => parseJsonLd(doc, null))
			)
		)
			.then(setAssertions)
			.catch((err) => {
				setAssertions([])
				console.error(err)
			})
	}, [example])

	const union = useMemo(() => {
		if (assertions === null || assertions.length === 0) {
			return null
		}
		return getCoproduct(assertions.map(({ dataset }) => dataset))
	}, [assertions])

	const unionGraphs = useMemo(() => {
		if (union === null) {
			return null
		}
		return union.getGraphs(null, null, null)
	}, [union])

	const tables = useMemo(() => {
		if (schema !== null && union !== null && union.size > 0) {
			return materialize(schema, union)
		}
		return null
	}, [schema, union])

	const handleUpload = useCallback(
		(event) =>
			Promise.all(
				Array.from(event.target.files).map((file) =>
					file
						.text()
						.then((text) => JSON.parse(text))
						.then((doc) => parseJsonLd(doc, null))
				)
			)
				.then((newAssertions) =>
					setAssertions(newAssertions.concat(assertions))
				)
				.catch((err) =>
					window.alert(`Error parsing JSON-LD: ${err.toString()}`)
				),
		[assertions]
	)

	const handleRemove = useCallback(
		(cid) => {
			const i = assertions.findIndex((assertion) => assertion.cid === cid)
			if (i !== -1) {
				if (assertions.length === 1) {
					setAssertions([])
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
								onClick={() => {
									setSchema(null)
									setExample(key)
								}}
							>
								{key}
							</button>
						))}
					</span>
				</header>

				<Schema value={shex} onChange={setSchema} />

				<header>
					<h2>Assertions</h2>
					<button onClick={setUnionHide} disabled={viewUnion === null}>
						Hide
					</button>
					<button onClick={setUnionGraph} disabled={viewUnion === "graph"}>
						View union dataset
					</button>
				</header>
				{union !== null && viewUnion === "graph" ? (
					<div
						className="union rdf-cytoscape"
						style={{ height: graphHeight * unionGraphs.length }}
					>
						<Dataset store={union} focus={undefined} />
					</div>
				) : null}
				<label className="upload">
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
				<header>
					<h2>Reduced dataset</h2>
					<span>
						<button onClick={setGraph} disabled={view === "graph"}>
							View graph
						</button>
						<button onClick={setTable} disabled={view === "table"}>
							View table
						</button>
					</span>
				</header>

				<div className="pushout rdf-cytoscape">
					{assertions.length === 0 ? (
						<code>No assertions</code>
					) : tables === null ? (
						<code>loading...</code>
					) : (
						<Result schema={schema} tables={tables} view={view} />
					)}
				</div>
			</section>
		</React.Fragment>
	)
}

function Result({ schema, tables, view }) {
	const store = useMemo(() => {
		if (view === "graph") {
			const dataset = getDataset(schema, tables)
			return new Store(dataset)
		}
		return null
	}, [schema, tables, view])

	if (view === "graph") {
		return <Dataset store={store} focus={undefined} />
	} else if (view === "table") {
		return (
			<React.Fragment>
				{Array.from(tables).map(([shape, table], i) =>
					i === 0 ? (
						<Table key={shape} shape={shape} table={table} />
					) : (
						<React.Fragment key={shape}>
							<hr />
							<Table shape={shape} table={table} />
						</React.Fragment>
					)
				)}
			</React.Fragment>
		)
	} else {
		return null
	}
}

function Table({ shape, table }) {
	const rows = Array.from(table)
	if (rows.length === 0) {
		return (
			<section className="table">
				<h3>{shape}</h3>
				<pre>Table is empty</pre>
			</section>
		)
	}
	const [[_, first]] = rows
	const header = Array.from(first.keys())
	return (
		<section className="table">
			<h3>{shape}</h3>
			<div>
				<table>
					<tbody>
						<tr key="header">
							<th key="id"></th>
							{header.map((property) => (
								<th key={property}>{property}</th>
							))}
						</tr>
						{rows.map(([id, properties]) => (
							<tr key={id}>
								<td key="id">{id}</td>
								{Array.from(properties).map(([predicate, values]) => (
									<td key={predicate}>{Array.from(values).join("\n")}</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</section>
	)
}
