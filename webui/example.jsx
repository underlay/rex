import React, { useState, useCallback, useEffect, useMemo } from "react"

import { Store } from "n3.ts"
import { Dataset } from "rdf-cytoscape"

import { getCoproduct } from "../lib/pushout.js"
import { materialize, getQuads } from "../lib/materialize.js"

import { parseJsonLd, parseNQuads } from "./parse.js"
import Assertion from "./assertion.jsx"
import Schema from "./schema.jsx"
import Table from "./table.jsx"

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

	const [headers, tables] = useMemo(() => {
		if (schema !== null && union !== null && union.size > 0) {
			return materialize(schema, union)
		}
		return [null, null]
	}, [schema, union])

	const handleJsonLdUpload = useCallback(
		(event) => {
			Promise.all(
				Array.from(event.target.files).map(async (file) => {
					const text = await file.text()
					return parseJsonLd(JSON.parse(text), null)
				})
			)
				.then((newAssertions) => {
					setAssertions(newAssertions.concat(assertions))
				})
				.catch((err) => {
					window.alert(`Error parsing JSON-LD document: ${err.toString()}`)
				})
		},
		[assertions]
	)

	const handleNQuadsUpload = useCallback(
		(event) => {
			Promise.all(
				Array.from(event.target.files).map(async (file) => {
					const text = await file.text()
					return parseNQuads(text)
				})
			)
				.then((newAssertions) => {
					setAssertions(newAssertions.concat(assertions))
				})
				.catch((err) =>
					window.alert(`Error parsing N-Quads file: ${err.toString()}`)
				)
		},
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
						<Dataset dataset={union} focus={undefined} />
					</div>
				) : null}
				<label className="upload">
					<span>Upload JSON-LD documents:</span>
					<input
						type="file"
						multiple={true}
						onChange={handleJsonLdUpload}
						accept=".json,.jsonld,application/json,application/ld+json"
					/>
				</label>
				<label className="upload">
					<span>Upload N-Quads files:</span>
					<input
						type="file"
						multiple={true}
						onChange={handleNQuadsUpload}
						accept=".nq,.nt,application/n-quads,application/n-triples"
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
						<Result tables={tables} headers={headers} view={view} />
					)}
				</div>
			</section>
		</React.Fragment>
	)
}

function Result({ headers, tables, view }) {
	const store = useMemo(() => {
		if (view === "graph") {
			const quads = []
			for (const [id, table] of tables) {
				for (const quad of getQuads(table, headers.get(id))) {
					quads.push(quad)
				}
			}
			return new Store(quads)
		}
		return null
	}, [tables, view])

	if (view === "graph") {
		return <Dataset dataset={store} focus={undefined} />
	} else if (view === "table") {
		return (
			<React.Fragment>
				{Array.from(tables).map(([shape, table], i) =>
					i === 0 ? (
						<Table
							key={shape}
							shape={shape}
							table={table}
							header={headers.get(shape)}
						/>
					) : (
						<React.Fragment key={shape}>
							<hr />
							<Table shape={shape} table={table} header={headers.get(shape)} />
						</React.Fragment>
					)
				)}
			</React.Fragment>
		)
	} else {
		return null
	}
}
