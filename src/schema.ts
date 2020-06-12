import {
	TypeOf,
	Type,
	type,
	partial,
	string,
	number,
	literal,
	array,
	union,
	intersection,
	recursion,
	tuple,
	failure,
	identity,
} from "io-ts/es6/index.js"
import { Right } from "fp-ts/lib/Either.js"

import ShExParser from "@shexjs/parser"

import { objectValue, NodeConstraint } from "./nodeConstraint.js"
import { rdfType } from "./utils.js"

const SemAct = intersection([
	type({ type: literal("SemAct"), name: string }),
	partial({ code: string }),
])

const annotations = array(
	type({
		type: literal("Annotation"),
		predicate: string,
		object: objectValue,
	})
)

export type ShapeAnd = {
	type: "ShapeAnd"
	shapeExprs: [ShExParser.NodeConstraint, Shape]
}

export type shapeExpr = string | ShExParser.NodeConstraint | Shape | ShapeAnd

export const ShapeAnd: Type<ShapeAnd> = recursion("ShapeAnd", () =>
	type({
		type: literal("ShapeAnd"),
		shapeExprs: tuple([NodeConstraint, Shape]),
	})
)

export const shapeExpr: Type<shapeExpr> = recursion("shapeExpr", () =>
	union([string, NodeConstraint, Shape, ShapeAnd])
)

export type valueExpr = shapeExpr | { type: "ShapeOr"; shapeExprs: shapeExpr[] }

const valueExpr: Type<valueExpr> = recursion("valueExpr", () =>
	union([
		shapeExpr,
		type({
			type: literal("ShapeOr"),
			shapeExprs: array(shapeExpr),
		}),
	])
)

export interface TripleConstraint {
	type: "TripleConstraint"
	predicate: string
	valueExpr?: valueExpr
	inverse?: false
	semActs?: TypeOf<typeof SemAct>[]
	min?: number
	max?: number
	annotations?: ShExParser.Annotation[]
}

const TripleConstraint: Type<TripleConstraint> = recursion(
	"TripleConstraint",
	() =>
		intersection([
			type({
				type: literal("TripleConstraint"),
				predicate: string,
			}),
			partial({
				valueExpr: valueExpr,
				inverse: literal(false),
				semActs: array(SemAct),
				annotations,
				min: number,
				max: number,
			}),
		])
)

export interface Shape {
	type: "Shape"
	expression: TypeOf<typeof TripleConstraint> | TypeOf<typeof EachOf>
}

const Shape: Type<Shape> = recursion("Shape", () =>
	type({
		type: literal("Shape"),
		expression: union([TripleConstraint, EachOf]),
	})
)

type UniqueTripleConstraints = [
	TripleConstraint,
	TripleConstraint,
	...TripleConstraint[]
]

const UniqueTripleConstraints = new Type<UniqueTripleConstraints>(
	"UniqueTripleConstraints",
	(input: unknown): input is UniqueTripleConstraints => {
		if (array(TripleConstraint).is(input)) {
			if (input.length > 1) {
				const predicates = new Set(input.map((c) => c.predicate))
				return predicates.size === input.length
			}
		}
		return false
	},
	(input, context) => {
		const result = array(TripleConstraint).validate(input, context)
		if (result._tag === "Right" && result.right.length > 1) {
			const { size } = new Set(result.right.map((c) => c.predicate))
			if (size !== result.right.length) {
				return failure(input, context)
			} else {
				return result as Right<UniqueTripleConstraints>
			}
		}
		return failure(input, context)
	},
	identity
)

const EachOf: Type<EachOf<TripleConstraint, TripleConstraint>> = type({
	type: literal("EachOf"),
	expressions: UniqueTripleConstraints,
})

const typedTripleConstraint = type({
	type: literal("TripleConstraint"),
	predicate: literal(rdfType),
	valueExpr: type({
		type: literal("NodeConstraint"),
		values: tuple([string]),
	}),
})

type TypedTripleConstraints = [
	TypeOf<typeof typedTripleConstraint>,
	TripleConstraint,
	...TripleConstraint[]
]

const TypedTripleConstraints = new Type<TypedTripleConstraints>(
	"TypedTripleConstraints",
	(input: unknown): input is TypedTripleConstraints =>
		UniqueTripleConstraints.is(input) && typedTripleConstraint.is(input[0]),
	(input, context) => {
		const result = UniqueTripleConstraints.validate(input, context)
		if (result._tag === "Right") {
			const [one, two, ...rest] = result.right
			const typed = typedTripleConstraint.validate(one, context)
			if (typed._tag === "Right") {
				return result as Right<TypedTripleConstraints>
			} else {
				return typed
			}
		} else {
			return result
		}
	},
	identity
)

export const Schema = type({
	type: literal("Schema"),
	shapes: array(
		type({
			type: literal("ShapeAnd"),
			id: string,
			shapeExprs: tuple([
				type({
					type: literal("NodeConstraint"),
					nodeKind: literal("bnode"),
				}),
				intersection([
					type({
						type: literal("Shape"),
						expression: union([
							typedTripleConstraint,
							type({
								type: literal("EachOf"),
								expressions: TypedTripleConstraints,
							}),
						]),
					}),
					partial({ annotations }),
				]),
			]),
		})
	),
})

interface EachOf<
	T1 extends TypeOf<typeof TripleConstraint>,
	T2 extends TypeOf<typeof TripleConstraint>
> {
	type: "EachOf"
	expressions: [T1, T2, ...T2[]]
}

interface Expression<
	T1 extends TypeOf<typeof TripleConstraint>,
	T2 extends TypeOf<typeof TripleConstraint>
> {
	type: "Shape"
	expression: T1 | EachOf<T1, T2>
}

export function getExpressions<
	T1 extends TypeOf<typeof TripleConstraint>,
	T2 extends TypeOf<typeof TripleConstraint>
>(shape: Expression<T1, T2>): [T1, ...T2[]] {
	if (shape.expression.type === "EachOf") {
		return shape.expression.expressions
	} else {
		return [shape.expression]
	}
}
