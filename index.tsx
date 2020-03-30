import React from "react"
import ReactDOM from "react-dom"

import ShExParser from "@shex/parser"
import ShExCore, { solutions } from "@shex/core"

import Graph from "rdf-cytoscape/lib/graph"

import "rdf-cytoscape/rdf-cytoscape.css"

import { parseQuads, writeQuads } from "./util"
import {
	DataFactory,
	N3Store,
	Quad_Subject,
	Quad_Predicate,
	Quad_Object,
	Store
} from "n3"

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
	// TODO: these need to be projected into the default graph and filtered for uniqueness
	const [dbA, dbB] = [ShExCore.Util.makeN3DB(a), ShExCore.Util.makeN3DB(b)]
	const maps = new Set([
		{ shape: schema.start, nodes: new Set(["http://example.com/john"]) }
	])

	const cloneA = new Store()
	const cloneB = new Store()
	const union = new Store()
	a.forEach(
		quad => {
			cloneA.addQuad(quad)
			union.addQuad(quad)
		},
		null,
		null,
		null,
		null
	)
	b.forEach(
		quad => {
			cloneB.addQuad(quad)
			union.addQuad(quad)
		},
		null,
		null,
		null,
		null
	)
	merge(schema, a, dbA, b, dbB, maps)

	// After everything is modified we add A to B
	a.forEach(quad => b.addQuad(quad), null, null, null, null)

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
							<Graph store={cloneA} graph="" focus={null} />
						</div>
					</div>
					<div>
						B
						<div className="rdf-cytoscape">
							<Graph store={cloneB} graph="" focus={null} />
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
							<Graph store={b} graph="" focus={null} />
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

function merge(
	schema: Schema,
	a: N3Store,
	dbA: ShExCore.DB,
	b: N3Store,
	dbB: ShExCore.DB,
	maps: Set<{ shape: shapeExpr; nodes: Set<string> }>
) {
	const validate = (db: ShExCore.DB, node: string, shape: shapeExpr) =>
		ShExCore.Validator.construct(schema).validate(db, node, shape)

	maps.forEach(({ shape, nodes }) =>
		nodes.forEach(node => {
			console.log(JSON.stringify({ node, shape }))
			const [A, B] = [validate(dbA, node, shape), validate(dbB, node, shape)]
			console.log(A, B)

			if (A.type === "ShapeTest" && B.type === "ShapeTest") {
				const s = schema.shapes.find(s => shapeId(shape) === shapeId(s))
				if (typeof s !== "string" && s.type === "Shape") {
					splice(s.expression, a, A.solution, b, B.solution)
				}
			}
		})
	)
}

function splice(
	expression: tripleExpr,
	a: N3Store,
	resultA: solutions<any>,
	b: N3Store,
	resultB: solutions<any>
) {
	if (typeof expression === "string") {
	} else if (
		expression.type === "EachOf" &&
		resultA.type === "EachOfSolutions" &&
		resultB.type === "EachOfSolutions"
	) {
		expression.expressions.forEach((s, i) =>
			splice(
				s,
				a,
				resultA.solutions[0].expressions[i],
				b,
				resultB.solutions[0].expressions[i]
			)
		)
	} else if (
		expression.type === "TripleConstraint" &&
		resultA.type === "TripleConstraintSolutions" &&
		resultB.type === "TripleConstraintSolutions"
	) {
		let [min, max] = [1, 1]
		if (expression.hasOwnProperty("min") && expression.hasOwnProperty("max")) {
			min = expression.min
			max = expression.max === -1 ? Infinity : expression.max
		}

		console.log("schema", expression, min, max)

		const uniqueInA = resultA.solutions.filter(
			testedTriple =>
				!resultB.solutions.some(({ object }) =>
					compareObjectValue(testedTriple.object, object)
				)
		)

		const total = resultB.solutions.length + uniqueInA.length

		if (min <= total && total <= max) {
			// Great
		} else if (max < total) {
			// Too many cooks
			// Take all of B and as many of A as will fit??
			// Or just take all of B and none of A?
			// OR just take unique ones?
			// Definitely just take unique ones...
			// So for now we make the executive decision to take unique elements
			// from A to fill B

			// What we really want to do is actually remove (!!) the ones we don't want
			const index = max - resultB.solutions.length
			for (const { subject, predicate, object } of uniqueInA.slice(index)) {
				console.log(subject, predicate, object)
				const s: Quad_Subject = (DataFactory as any).internal.fromId(subject)
				const p: Quad_Predicate = (DataFactory as any).internal.fromId(
					predicate
				)
				const o = parseObjectValue(object)
				console.log(s, p, o)
				a.removeQuad(s, p, o)
			}
		} else {
			// ???
		}
	}
}

function shapeId(a: shapeExpr): string {
	if (typeof a === "string") {
		return a
	} else {
		return a.id
	}
}

function compareObjectValue(a: objectValue, b: objectValue): boolean {
	if (typeof a === "string" || typeof b === "string") {
		return a === b
	} else {
		return a.value === b.value && a.type === b.type && a.language === b.language
	}
}

function parseObjectValue(node: objectValue): Quad_Object {
	if (typeof node === "string") {
		return (DataFactory as any).internal.fromId(node) as Quad_Object
	} else if (node.language) {
		return DataFactory.literal(node.value, node.language)
	} else if (node.type) {
		return DataFactory.literal(node.value, DataFactory.namedNode(node.type))
	} else {
		return DataFactory.literal(node.value)
	}
}
