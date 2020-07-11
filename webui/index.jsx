import "rdf-cytoscape/rdf-cytoscape.css"

import React from "react"
import ReactDOM from "react-dom"

import Example from "./example.jsx"

const examples = new Map([
	["person", ["a.jsonld", "b.jsonld"]],
	["bib", ["a.jsonld", "b.jsonld", "c.jsonld", "d.jsonld"]],
])

async function main() {
	ReactDOM.render(
		<React.Fragment>
			<div className="example">
				<Example examples={examples} initialExample={"person"} />
			</div>
		</React.Fragment>,
		document.querySelector("main")
	)
}

main().catch((err) => console.error(err))
