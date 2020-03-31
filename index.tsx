import React from "react"
import ReactDOM from "react-dom"

import ShExParser from "@shex/parser"
import ShExCore from "@shex/core"

import Graph from "rdf-cytoscape/lib/graph"

import "rdf-cytoscape/rdf-cytoscape.css"

import { parseQuads, writeQuads } from "./util"
import { Store } from "n3"
import { merge } from "./reduce"

const parser = ShExParser.construct()

const main = document.querySelector("main")

Promise.all([
	fetch("person.shex")
		.then(res => res.text())
		.then(shex => [shex, parser.parse(shex)] as [string, Schema]),
	fetch("a.nt")
		.then(res => res.text())
		.then(parseQuads),
	fetch("b.nt")
		.then(res => res.text())
		.then(parseQuads)
]).then(([[shex, schema], a, b]) => {
	;(window as any).schema = schema
	// TODO: these need to be projected into the default graph and filtered for uniqueness
	const maps: Map<shapeExprRef | ShExCore.Start, Set<string>> = new Map([
		[ShExCore.Validator.start, new Set(["http://example.com/john"])]
	])

	// const aaa = ShExCore.Util as any
	// console.log(aaa, schema)

	const union = new Store()
	for (const quad of a.getQuads(null, null, null, null)) {
		union.addQuad(quad)
	}

	for (const quad of b.getQuads(null, null, null, null)) {
		union.addQuad(quad)
	}

	const merged = merge(schema, maps, a, b)

	function Schema(props: {}) {
		// return <pre>{JSON.stringify(schema, null, "  ")}</pre>
		return <pre>{shex}</pre>
	}

	function Index() {
		return (
			<React.Fragment>
				<Schema />

				<section style={{ display: "flex", flexWrap: "wrap" }}>
					<div>
						A
						<div className="rdf-cytoscape">
							<Graph store={a} graph="" focus={null} />
						</div>
					</div>
					<div>
						B
						<div className="rdf-cytoscape">
							<Graph store={b} graph="" focus={null} />
						</div>
					</div>
					<div>
						Direct union
						<div className="rdf-cytoscape">
							<Graph store={union} graph="" focus={null} />
						</div>
					</div>
					<div>
						Reduced union
						<div className="rdf-cytoscape">
							<Graph store={merged} graph="" focus={null} />
						</div>
					</div>
				</section>
			</React.Fragment>
		)
	}

	console.log("wtf")

	ReactDOM.render(<Index />, main)

	writeQuads(b)
		.then(s => console.log(s))
		.catch(e => console.error(e))
})
