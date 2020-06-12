import { TypeOf } from "io-ts/es6/index.js"
import * as N3 from "n3"
import RDF from "rdf-js"

const { DataFactory } = N3

import ShExParser from "@shexjs/parser"

import { getLinkMap, getLinkMapClosure } from "./links.js"

import { Schema, Shape, ShapeAnd, getExpressions, valueExpr } from "./schema.js"
import { cospan } from "./cospan.js"

import nodeSatisfies from "./nodeSatisfies.js"
import { dataType } from "./nodeConstraint.js"
import { toId, rdfType } from "./utils.js"

const rdfTypeNode = DataFactory.namedNode(rdfType)

type State = Readonly<{
	path: (string | number)[]
	values: (RDF.Quad_Subject | null)[]
	types: TypeMap
	tables: Map<string, Set<string>>
	deferrals: Map<
		string,
		Readonly<{
			subject: RDF.BlankNode
			values: (RDF.Quad_Subject | null)[]
			path: (string | number)[]
		}>[]
	>
	coproduct: N3.N3Store
	components: Map<string, string>
	inverse: Map<string, Set<string>>
	pushout: N3.N3Store
}>

type TypeMap = Map<
	string,
	Readonly<{ type: string; shapeExpr: ShapeAnd; key?: string }>
>

function getTypeMap(schema: TypeOf<typeof Schema>): TypeMap {
	return new Map(
		schema.shapes.map((shapeExpr) => {
			const {
				id,
				shapeExprs: [_, shape],
			} = shapeExpr

			const [
				{
					valueExpr: {
						values: [type],
					},
				},
			] = getExpressions(shape)

			const value: {
				shapeExpr: ShapeAnd
				type: string
				key?: string
			} = { type, shapeExpr }

			for (const { predicate, object } of shape.annotations || []) {
				if (
					predicate === "http://underlay.org/ns/rex#key" &&
					typeof object === "string"
				) {
					value.key = object
					break
				}
			}
			return [id, Object.freeze(value)]
		})
	)
}

interface Tree {
	termType: "Tree"
	subject: RDF.Quad_Subject
	properties: Map<string, Node[]>
}

type Node = RDF.Quad_Object | Readonly<Tree>

function* matchTripleConstraint(
	subject: RDF.Quad_Subject,
	predicate: RDF.Quad_Predicate,
	valueExpr: undefined | valueExpr,
	state: State
): Generator<Node> {
	const objects = state.pushout.getObjects(subject, predicate, null)
	console.log("got objects2", objects)
	state.path.push(toId(predicate))
	state.values.push(subject)
	for (const object of objects) {
		if (valueExpr === undefined) {
			yield object
		} else {
			yield* matchValueExpr(object, valueExpr, state)
		}
	}
	state.path.pop()
	state.values.pop()
}

function* matchValueExpr(
	object: RDF.Quad_Object,
	valueExpr: valueExpr,
	state: State
): Generator<Node> {
	console.log("matching value expr", object, valueExpr)
	if (typeof valueExpr === "string") {
		if (object.termType === "BlankNode") {
			const table = state.tables.get(valueExpr)

			if (table === undefined) {
				const { type } = state.types.get(valueExpr)!
				const typeNode = DataFactory.namedNode(type)
				const n = state.pushout.countQuads(object, rdfTypeNode, typeNode, null)
				if (n > 0) {
					console.error("Out-of-order schema reference", valueExpr)
					const path = [...state.path]
					const values = [...state.values]
					const deferral = Object.freeze({ subject: object, path, values })

					const deferrals = state.deferrals.get(valueExpr)
					if (deferrals === undefined) {
						state.deferrals.set(valueExpr, [deferral])
					} else {
						deferrals.push(deferral)
					}
				}
			} else if (table.has(toId(object))) {
				yield object
			}
		}
	} else if (valueExpr.type === "NodeConstraint") {
		if (nodeSatisfies(object, valueExpr)) {
			yield object
		}
	} else if (valueExpr.type === "ShapeOr") {
		for (const [i, shapeExpr] of valueExpr.shapeExprs.entries()) {
			state.path.push(i)
			state.values.push(null)
			yield* matchValueExpr(object, shapeExpr, state)
			state.path.pop()
			state.values.pop()
		}
	} else if (object.termType === "Literal") {
		// Do nothing, since the valueExpr is a shape
		// and so only quad subjects (IRIs or blank nodes)
		// can validate it
	} else {
		state.values.push(object)
		yield* matchShape(object, valueExpr, state)
		state.values.pop()
	}
}

type Reference = [Generator<Node>, string, number, number]

function* matchShape(
	subject: RDF.Quad_Subject,
	shapeExpr: Shape | ShapeAnd,
	state: State
): Generator<Readonly<Tree>> {
	const [nodeConstraint, shape] = getShape(shapeExpr)
	if (nodeConstraint !== null) {
		if (!nodeSatisfies(subject, nodeConstraint)) {
			return
		}
	}

	const tripleConstraints = getExpressions(shape)

	const properties: Map<string, Array<Node>> = new Map()
	const references: Map<string, Reference> = new Map()
	for (const {
		predicate,
		valueExpr,
		min,
		max,
		annotations,
	} of tripleConstraints) {
		const values = matchTripleConstraint(
			subject,
			DataFactory.namedNode(predicate),
			valueExpr,
			state
		)

		const floor = min === undefined ? 1 : min,
			ceiling = max === undefined ? 1 : max === -1 ? Infinity : max

		const reference = annotations && annotations.find(isWithAnnotation)
		if (reference !== undefined) {
			references.set(predicate, [values, reference.object, floor, ceiling])
			continue
		}

		const sort = annotations && annotations.find(isSortAnnotation)
		const less = getOrder(valueExpr, sort && sort.object)
		const nodes = collect(values, less, ceiling)
		if (nodes.length < floor) {
			return
		} else {
			properties.set(predicate, nodes)
		}
	}

	for (const [predicate, [values, by, floor, ceiling]] of references) {
		const reference = properties.get(by)
		if (reference === undefined) {
			throw new Error("Invalid sort with property reference")
		}

		const p = DataFactory.namedNode(predicate)
		const ref = DataFactory.namedNode(by)

		const indices: Map<string, number> = new Map()
		for (const [i, objectNode] of reference.entries()) {
			const object = getNodeTerm(objectNode)
			for (const key of coKeys(subject, ref, object, state)) {
				indices.set(key, i)
			}
		}

		const indexCache: Map<string, number> = new Map()

		const cache = (id: string, term: RDF.Quad_Object): number => {
			const index = indexCache.get(id)
			if (index !== undefined) {
				return index
			}

			let max = NaN
			for (const key of coKeys(subject, p, term, state)) {
				const index = indices.get(key)
				if (index !== undefined) {
					if (isNaN(max) || index > max) {
						max = index
					}
				}
			}

			indexCache.set(id, max)
			return max
		}

		const less = (a: Node, b: Node) => {
			const termA = getNodeTerm(a)
			const idA = toId(termA)
			const A = cache(idA, termA)
			const termB = getNodeTerm(b)
			const idB = toId(termB)
			const B = cache(idB, termB)
			if (isNaN(A) && isNaN(B)) {
				return termA.value < termB.value
			} else if (isNaN(A)) {
				return true
			} else if (isNaN(B)) {
				return false
			} else {
				return A < B
			}
		}

		const nodes = collect(values, less, ceiling)
		if (nodes.length < floor) {
			return
		} else {
			properties.set(predicate, nodes)
		}
	}

	yield Object.freeze({ termType: "Tree", subject, properties })
}

function* coSubjects(
	subject: RDF.Quad_Subject,
	{ inverse }: { inverse: Map<string, Set<string>> }
): Generator<RDF.Quad_Subject> {
	if (subject.termType === "BlankNode") {
		for (const id of inverse.get(subject.value)!) {
			yield DataFactory.blankNode(id)
		}
	} else {
		yield subject
	}
}

function* coKeys(
	subject: RDF.Quad_Subject,
	predicate: RDF.Quad_Predicate,
	object: RDF.Quad_Object,
	state: State
): Generator<string> {
	for (const coSubject of coSubjects(subject, state)) {
		const graphs = state.coproduct.getGraphs(coSubject, predicate, object)
		for (const graph of graphs) {
			const graphId = toId(graph)
			if (coSubject.termType === "BlankNode") {
				yield `${coSubject.value}\t${graphId}`
			} else {
				yield graphId
			}
		}
	}
}

const getNodeTerm = (node: Node) =>
	node.termType === "Tree" ? node.subject : node

function collect(
	values: Generator<Node>,
	less: (a: Node, b: Node) => boolean,
	ceiling: number
): Array<Node> {
	const array: Array<Node> = []
	for (const a of values) {
		const i = array.findIndex((b) => less(a, b))
		if (i === -1) {
			array.push(a)
		} else {
			array.splice(i, 0, a)
		}
		if (array.length > ceiling) {
			array.shift()
		}
	}
	return array
}

const xsdDateTime = "http://www.w3.org/2001/XMLSchema#dateTime"
const sortPredicate = "http://underlay.org/ns/rex#sort"
const sortLatest = "http://underlay.org/ns/rex#latest"
type sortRange = typeof sortLatest
const isSortAnnotation = (
	annotation: ShExParser.Annotation
): annotation is ShExParser.Annotation<typeof sortPredicate, sortRange> =>
	annotation.predicate === sortPredicate &&
	typeof annotation.object === "string"

const withPredicate = "http://underlay.org/ns/rex#with"
const isWithAnnotation = (
	annotation: ShExParser.Annotation
): annotation is ShExParser.Annotation<typeof withPredicate, string> =>
	annotation.predicate === withPredicate &&
	typeof annotation.object === "string"

function getOrder(
	valueExpr: valueExpr | undefined,
	sort: string | undefined
): (a: Node, b: Node) => boolean {
	if (sort === sortLatest) {
		if (
			valueExpr !== undefined &&
			dataType.is(valueExpr) &&
			valueExpr.datatype === xsdDateTime
		) {
			return (a: Node, b: Node) =>
				(a as RDF.Literal).value < (b as RDF.Literal).value
		}
		const hmm = dataType.decode(valueExpr)
		if (hmm._tag === "Left") {
			console.error(valueExpr, hmm.left)
		}
		throw new Error(
			"Cannot sort by rex:latest on a valueExpr that is not a node constraint with datatype xsd:dateTime"
		)
	}

	return (a: Node, b: Node) => getNodeTerm(a).value < getNodeTerm(b).value
}

function getShape(
	shape: Shape | ShapeAnd
): [ShExParser.NodeConstraint | null, Shape] {
	if (shape.type === "ShapeAnd") {
		return shape.shapeExprs
	} else {
		return [null, shape]
	}
}

function sortDependenies(
	linkClosure: Map<string, Set<string>>
): [string, Set<string>][] {
	return Array.from(linkClosure.entries()).sort(
		([a, as]: [string, Set<string>], [b, bs]: [string, Set<string>]) => {
			if (as.size === 0 && bs.size === 0) {
				return 0
			} else if (as.size === 0) {
				return -1
			} else if (bs.size === 0) {
				return 1
			} else if (!as.has(b) && bs.has(a)) {
				return -1
			} else if (as.has(b) && !bs.has(a)) {
				return 1
			} else {
				console.warn(
					"Warning: mutually recursive schemas",
					a,
					"<->",
					b,
					"detected! Things might not work (but maybe they will)"
				)
				return 0 // TODO: you could have some heuristic here
			}
		}
	)
}

function populateDataset(tree: Readonly<Tree>, dataset: N3.Quad[]) {
	for (const [property, objects] of tree.properties) {
		const predicate = DataFactory.namedNode(property)
		for (const object of objects) {
			if (object.termType === "Tree") {
				populateDataset(object, dataset)
			} else {
				dataset.push(DataFactory.quad(tree.subject, predicate, object))
			}
		}
	}
}

export function materialize(
	schema: TypeOf<typeof Schema>,
	datasets: RDF.Quad[][]
): N3.Quad[] {
	const types = getTypeMap(schema)
	const links = getLinkMap(schema)
	const linkClosure = getLinkMapClosure(links)
	const dependencies = sortDependenies(linkClosure)
	const dataset: N3.Quad[] = []

	const path: (string | number)[] = []
	const values: (RDF.Quad_Subject | null)[] = []
	const [tables, deferrals] = [new Map(), new Map()]
	const state: State = Object.freeze(
		Object.assign(
			{ types, tables, deferrals, path, values },
			cospan(types, datasets)
		)
	)

	for (const [shape, outgoing] of dependencies) {
		const table: Set<string> = new Set()

		const { type, shapeExpr } = types.get(shape)!
		const subjects = state.pushout.getSubjects(
			rdfTypeNode,
			DataFactory.namedNode(type),
			null
		)

		state.path.push(shape)
		for (const subject of subjects) {
			state.values.push(subject)
			for (const tree of matchShape(subject, shapeExpr, state)) {
				table.add(toId(tree.subject))
				populateDataset(tree, dataset)
			}
			state.values.pop()
		}
		state.path.pop()

		state.tables.set(shape, table)
		const deferrals = state.deferrals.get(shape)
		if (deferrals !== undefined) {
			for (const { subject, values, path } of deferrals) {
			}
		}
	}

	return dataset
}
