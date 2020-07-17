import "rdf-cytoscape/rdf-cytoscape.css"

import React from "react"
import ReactDOM from "react-dom"

import Example from "./example.jsx"

const examples = new Map([
	["person/schema.shex", ["person/a.jsonld", "person/b.jsonld"]],
	[
		"bib/schema.shex",
		["bib/a.jsonld", "bib/b.jsonld", "bib/c.jsonld", "bib/d.jsonld"],
	],
	[
		"article/schema.shex",
		["article/a.jsonld", "article/b.jsonld", "article/c.jsonld"],
	],
])

async function main() {
	ReactDOM.render(
		<React.Fragment>
			<div className="example">
				<Example examples={examples} initialExample={"person/schema.shex"} />
			</div>
		</React.Fragment>,
		document.querySelector("main")
	)
}

main().catch((err) => console.error(err))
