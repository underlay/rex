import "rdf-cytoscape/rdf-cytoscape.css"

import React from "react"
import ReactDOM from "react-dom"

import { cid, serialize } from "ipld-dag-cbor/src/util.js"

import { parseJsonLd } from "./parse.js"
import Example from "./example.jsx"

const worker = new Worker("webui/lib/worker.min.js")

async function main() {
	const [shex, a, b] = await Promise.all([
		fetch("webui/person.shex").then((res) => res.text()),
		fetch("webui/a.jsonld").then((res) => res.json()),
		fetch("webui/b.jsonld").then((res) => res.json()),
	])

	const A = await parseJsonLd(a, null)
	const B = await parseJsonLd(b, null)
	const cidA = await cid(serialize(a))
	const cidB = await cid(serialize(b))
	const assertions = [
		{ cid: cidA.toString(), dataset: A },
		{ cid: cidB.toString(), dataset: B },
	]

	ReactDOM.render(
		<React.Fragment>
			{/* <div className="example">
				<Index {...props} />
			</div> */}
			<div className="example">
				<Example worker={worker} shex={shex} assertions={assertions} />
			</div>
		</React.Fragment>,
		document.querySelector("main")
	)
}

main().catch((err) => console.error(err))
