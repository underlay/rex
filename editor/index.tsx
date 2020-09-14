import React from "react"
import ReactDOM from "react-dom"

import jsonld from "jsonld"

import "../apg/schema.schema.jsonld"

import { Label, context, Type, isReference } from "../lib/apg/schema.js"
import { parseSchemaString } from "../lib/apg/shex.js"

import {
	setArrayIndex,
	validateKey,
	findError,
	compactLabelWithNamespace,
} from "./utils"
import { LabelConfig } from "./label"
import { Namespace } from "./namespace"
import { Graph } from "./graph"

const main = document.querySelector("main")

const schemaSchemaURL = "lib/schema.schema.jsonld"
const schemaSchemaFile = fetch(schemaSchemaURL).then((res) => res.json())

const defaultNamespace = "http://example.com/ns/"

let labelId = 0

function Index({}) {
	const [clean, setClean] = React.useState(true)
	const [namespace, setNamespace] = React.useState<null | string>(
		defaultNamespace
	)
	const [labels, setLabels] = React.useState<Label[]>([])
	const [labelMap, setLabelMap] = React.useState<Map<string, string>>(new Map())

	const handleClick = React.useCallback(
		({}) =>
			setLabels([
				...labels,
				{
					id: `_:l${labelId++}`,
					type: "label",
					key: "",
					value: { type: "nil" },
				},
			]),
		[labels]
	)

	const handleRemove = React.useCallback(
		(index: number) => {
			const nextLabels = labels.slice()
			const [] = nextLabels.splice(index, 1)
			setLabels(nextLabels)
		},
		[labels]
	)

	const [exportUrl, setExportUrl] = React.useState<null | Error | string>(null)
	const handleExportClick = React.useCallback(
		({}) => {
			const labelKeys: Set<string> = new Set()
			for (const label of labels) {
				if (!validateKey(label.key, namespace)) {
					setExportUrl(new Error("Invalid label key"))
					return
				} else if (labelKeys.has(label.key)) {
					setExportUrl(new Error("Duplicate label key"))
					return
				} else {
					const error = findError(label.value, namespace)
					if (error !== null) {
						setExportUrl(error)
						return
					}
				}
			}

			const doc = {
				"@context":
					namespace === null ? context : [{ "@base": namespace }, context],
				"@graph": labels,
			}
			jsonld
				.normalize(doc, { algorithm: "URDNA2015" })
				.then((normalized) =>
					setExportUrl(URL.createObjectURL(new Blob([normalized])))
				)
		},
		[labels]
	)

	const handleImport = React.useCallback(
		(labels: Label[], namespace: null | string) => {
			compactLabelWithNamespace(labels, namespace)
			setNamespace(namespace)
			setLabels(labels)
			setClean(true)
			setLabelMap(new Map(labels.map((label) => [label.id, label.key])))
		},
		[]
	)

	const handleImportChange = React.useCallback(
		({ target: { files } }: React.ChangeEvent<HTMLInputElement>) => {
			if (files !== null && files.length === 1) {
				const [file] = files
				Promise.all([schemaSchemaFile, file.text()]).then(
					([{ "@graph": schemaSchema }, input]) => {
						const labels = parseSchemaString(input, schemaSchema)
						console.log("imported labels", labels)
						handleImport(labels, null)
					}
				)
			}
		},
		[]
	)

	React.useEffect(() => {
		if (typeof exportUrl === "string") {
			URL.revokeObjectURL(exportUrl)
			setExportUrl(null)
		} else if (exportUrl instanceof Error) {
			setExportUrl(null)
		}
	}, [labels])

	const handleLoadExampleClick = React.useCallback(({}) => {
		schemaSchemaFile.then(({ "@graph": schemaSchema }: { "@graph": Label[] }) =>
			handleImport(schemaSchema, "http://underlay.org/ns/")
		)
	}, [])

	return (
		<React.Fragment>
			<header>
				<h1>UL Schema Editor</h1>
				<button onClick={handleLoadExampleClick}>Load example</button>
				<input
					type="file"
					onChange={handleImportChange}
					accept=".nq,application/n-quads,.nt,application/n-triples"
				/>
				{exportUrl === null ? (
					<button onClick={handleExportClick}>Export</button>
				) : exportUrl instanceof Error ? (
					<span className="error">{exportUrl.toString()}</span>
				) : (
					<a href={exportUrl}>Download</a>
				)}
			</header>

			<div className="panels">
				<section className="editor">
					<Namespace namespace={namespace} onChange={setNamespace} />
					<div className="header">
						<span>Labels</span>
						<button className="add" onClick={handleClick}>
							Add label
						</button>
					</div>
					{labels.map((label, index) => (
						<LabelConfig
							key={label.id}
							index={index}
							id={label.id}
							keyName={label.key}
							value={label.value}
							labels={labelMap}
							namespace={namespace}
							clean={clean}
							onChange={(label) => {
								if (label.key !== labels[index].key) {
									setLabelMap(new Map(labelMap).set(label.id, label.key))
								}
								const nextLabels = setArrayIndex(labels, label, index)
								setLabels(nextLabels)
								setClean(false)
							}}
							onRemove={handleRemove}
						/>
					))}
				</section>
				<section className="graph">
					<Graph labels={labels} />
				</section>
			</div>
		</React.Fragment>
	)
}

ReactDOM.render(<Index />, main)
