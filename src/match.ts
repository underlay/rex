import RDF from "rdf-js"
import ShExParser from "@shexjs/parser"
import { DataFactory } from "n3"
import { TypeOf } from "io-ts/es6/index.js"

import {
	getExpressions,
	Shape,
	ShapeAnd,
	valueExpr,
	TripleConstraint,
	isSortAnnotation,
	sortBoolean,
	booleanDatatype,
	numericDatatype,
	temporalDatatype,
	sortNumeric,
	sortTemporal,
	baseTripleConstraint,
} from "./schema.js"
import { State, Tree, Node, Property } from "./state.js"
import { toId } from "./utils.js"
import nodeSatisfies, { TypedLiteral } from "./satisfies.js"

import { getTypeOrder, getOrder } from "./order.js"
import { rdfTypeNode } from "./vocab.js"

function matchLiteralType<C extends sortNumeric | sortTemporal | sortBoolean>(
	node: RDF.Term,
	tripleConstraint: baseTripleConstraint & C
): node is TypedLiteral<C["valueExpr"]["datatype"]> {
	return (
		node.termType === "Literal" &&
		tripleConstraint.valueExpr.datatype === node.datatype.value
	)
}

function* matchSortedTripleConstraint<
	C extends sortNumeric | sortTemporal | sortBoolean
>(
	subject: RDF.Quad_Subject,
	tripleConstraint: baseTripleConstraint & C,
	state: State
): Generator<TypedLiteral<C["valueExpr"]["datatype"]>, void, undefined> {
	const predicate = DataFactory.namedNode(tripleConstraint.predicate)
	const objects = state.pushout.getObjects(subject, predicate, null)
	for (const object of objects) {
		if (matchLiteralType(object, tripleConstraint)) {
			if (nodeSatisfies(object, tripleConstraint.valueExpr)) {
				yield object
			}
		}
	}
}

function* matchTripleConstraint(
	subject: RDF.Quad_Subject,
	tripleConstraint: TripleConstraint,
	state: State
): Generator<Node, void, undefined> {
	const predicate = DataFactory.namedNode(tripleConstraint.predicate)
	const objects = state.pushout.getObjects(subject, predicate, null)
	for (const object of objects) {
		if (tripleConstraint.valueExpr === undefined) {
			yield object
		} else {
			state.path.push([tripleConstraint.predicate, toId(object)])
			yield* matchValueExpr(object, tripleConstraint.valueExpr, state)
			state.path.pop()
		}
	}
}

function* matchValueExpr(
	object: RDF.Quad_Object,
	valueExpr: valueExpr,
	state: State
): Generator<Node, void, undefined> {
	if (typeof valueExpr === "string") {
		if (object.termType === "BlankNode") {
			const { type } = state.types.get(valueExpr)!
			const typeNode = DataFactory.namedNode(type)
			const n = state.pushout.countQuads(object, rdfTypeNode, typeNode, null)
			if (n > 0) {
				const key = `${valueExpr}\t${toId(object)}`
				const references = state.references.get(key)
				if (references === undefined) {
					state.references.set(key, [[...state.path]])
				} else {
					references.push([...state.path])
				}
				yield object
			}
		}
	} else if (valueExpr.type === "NodeConstraint") {
		if (nodeSatisfies(object, valueExpr)) {
			yield object
		}
	} else if (valueExpr.type === "ShapeOr") {
		for (const shapeExpr of valueExpr.shapeExprs) {
			yield* matchValueExpr(object, shapeExpr, state)
		}
	} else if (object.termType === "Literal") {
		// Do nothing, since the valueExpr is a shape
		// and so only quad subjects (IRIs or blank nodes)
		// can validate it
	} else {
		yield* matchShape(object, valueExpr, state)
	}
}

export function* matchShape(
	subject: RDF.Quad_Subject,
	shapeExpr: Shape | ShapeAnd,
	state: State
): Generator<Readonly<Tree>, void, undefined> {
	const [nodeConstraint, shape] = getShape(shapeExpr)
	if (nodeConstraint !== null) {
		if (!nodeSatisfies(subject, nodeConstraint)) {
			return
		}
	}

	const tripleConstraints = getExpressions(shape)

	const properties: Map<
		string,
		| Property<Node>
		| Property<
				TypedLiteral<numericDatatype | temporalDatatype | booleanDatatype>
		  >
	> = new Map()

	for (const tripleConstraint of tripleConstraints) {
		const { predicate, min, max } = tripleConstraint
		if (isSortAnnotation(tripleConstraint)) {
			const values = matchSortedTripleConstraint(
				subject,
				tripleConstraint,
				state
			)

			const order = getTypeOrder(tripleConstraint)
			const property: Property<TypedLiteral<
				typeof tripleConstraint["valueExpr"]["datatype"]
			>> = {
				order: order,
				values: Array.from(values),
				min: min === undefined ? 1 : min,
				max: max === undefined ? 1 : max === -1 ? Infinity : max,
			}

			properties.set(predicate, property)
		} else {
			const values = matchTripleConstraint(subject, tripleConstraint, state)
			properties.set(predicate, {
				order: getOrder(tripleConstraint),
				values: Array.from(values),
				min: min === undefined ? 1 : min,
				max: max === undefined ? 1 : max === -1 ? Infinity : max,
			})
		}
	}

	yield Object.freeze({ termType: "Tree", subject, properties })
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
