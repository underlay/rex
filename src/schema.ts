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
	brand,
	Branded,
} from "io-ts/es6/index.js"
import { Right } from "fp-ts/lib/Either.js"

import ShExParser from "@shexjs/parser"

import {
	xsdDecimal,
	xsdFloat,
	xsdDouble,
	integerDatatype,
} from "./satisfies.js"

import { NodeConstraint, dataTypeConstraint } from "./constraint.js"
import { rdfType, rex, xsdDateTime, xsdDate, xsdBoolean } from "./vocab.js"

interface sortAnnotation<T extends string> {
	type: "Annotation"
	predicate: typeof rex.sort
	object: T
}

export const lexicographic = union([
	literal(rex.ascending),
	literal(rex.descending),
])
;(window as any).lexicographic = lexicographic

export const numeric = union([literal(rex.greater), literal(rex.lesser)])
export const temporal = union([literal(rex.earlier), literal(rex.later)])
export const boolean = union([literal(rex.and), literal(rex.or)])

const sortAnnotation = <T extends string>(
	object: Type<T>
): Type<sortAnnotation<T>> =>
	type({
		type: literal("Annotation"),
		predicate: literal(rex.sort),
		object,
	})

const keyAnnotation = type({
	type: literal("Annotation"),
	predicate: literal(rex.key),
	object: string,
})

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

export type sortDatatype<T extends string, S extends string> = {
	valueExpr: dataTypeConstraint<T>
	annotations: [sortAnnotation<S>]
}

export type numericDatatype =
	| TypeOf<typeof integerDatatype>
	| typeof xsdDouble
	| typeof xsdDecimal
	| typeof xsdFloat

export type sortNumeric = sortDatatype<numericDatatype, TypeOf<typeof numeric>>

export type temporalDatatype = typeof xsdDateTime | typeof xsdDate

export type sortTemporal = sortDatatype<
	temporalDatatype,
	TypeOf<typeof temporal>
>

export type booleanDatatype = typeof xsdBoolean

export type sortBoolean = sortDatatype<booleanDatatype, TypeOf<typeof boolean>>

export type sortLexicographic = {
	valueExpr?: valueExpr
	annotations?: [sortAnnotation<TypeOf<typeof lexicographic>>]
}

type tripleConstraintAnnotation =
	| sortNumeric
	| sortTemporal
	| sortBoolean
	| sortLexicographic

export function isNumeric(
	tripleConstraint: tripleConstraintAnnotation
): tripleConstraint is sortNumeric {
	if (tripleConstraint.annotations === undefined) {
		return false
	} else {
		const [{ object }] = tripleConstraint.annotations
		return numeric.is(object)
	}
}

export function isTemporal(
	tripleConstraint: tripleConstraintAnnotation
): tripleConstraint is sortTemporal {
	if (tripleConstraint.annotations === undefined) {
		return false
	} else {
		const [{ object }] = tripleConstraint.annotations
		return temporal.is(object)
	}
}

export function isBoolean(
	tripleConstraint: tripleConstraintAnnotation
): tripleConstraint is sortBoolean {
	if (tripleConstraint.annotations === undefined) {
		return false
	} else {
		const [{ object }] = tripleConstraint.annotations
		return boolean.is(object)
	}
}

export function isSortAnnotation(
	tripleConstraint: baseTripleConstraint &
		(sortNumeric | sortTemporal | sortBoolean | sortLexicographic)
): tripleConstraint is baseTripleConstraint &
	(sortNumeric | sortTemporal | sortBoolean) {
	if (tripleConstraint.annotations === undefined) {
		return false
	}
	const [{ object }] = tripleConstraint.annotations
	return !lexicographic.is(object)
}

export type baseTripleConstraint = {
	type: "TripleConstraint"
	predicate: string
	inverse?: false
	min?: number
	max?: number
}

export type TripleConstraint = baseTripleConstraint & tripleConstraintAnnotation
const lexicographicAnnotation = tuple([sortAnnotation(lexicographic)])
const TripleConstraint: Type<TripleConstraint> = recursion(
	"TripleConstraint",
	() =>
		intersection([
			type({
				type: literal("TripleConstraint"),
				predicate: string,
			}),
			partial({
				inverse: literal(false),
				min: number,
				max: number,
			}),
			union([
				type({
					valueExpr: dataTypeConstraint(
						union([
							literal(xsdDouble),
							literal(xsdDecimal),
							literal(xsdFloat),
							integerDatatype,
						])
					),
					annotations: tuple([sortAnnotation(numeric)]),
				}),
				type({
					valueExpr: dataTypeConstraint(
						union([literal(xsdDate), literal(xsdDateTime)])
					),
					annotations: tuple([sortAnnotation(temporal)]),
				}),
				type({
					valueExpr: dataTypeConstraint(literal(xsdBoolean)),
					annotations: tuple([sortAnnotation(boolean)]),
				}),
				partial({
					valueExpr: valueExpr,
					annotations: lexicographicAnnotation,
				}),
			]),
		])
)

export interface Shape {
	type: "Shape"
	expression: TripleConstraint | TypeOf<typeof EachOf>
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

const emptyProductShape = type({
	type: literal("Shape"),
	expression: typedTripleConstraint,
})

const productShape = intersection([
	type({
		type: literal("Shape"),
		expression: type({
			type: literal("EachOf"),
			expressions: TypedTripleConstraints,
		}),
	}),
	partial({ annotations: tuple([keyAnnotation]) }),
])

const product = union([emptyProductShape, productShape])

export const isEmptyProductShape = (
	shape: TypeOf<typeof product>
): shape is TypeOf<typeof emptyProductShape> =>
	shape.expression.type === "TripleConstraint"

const schema = type({
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
				product,
			]),
		})
	),
})

interface KeyedSchemaBrand {
	readonly KeyedSchema: unique symbol
}

export const Schema = brand(
	schema,
	(s): s is Branded<TypeOf<typeof schema>, KeyedSchemaBrand> =>
		s.shapes.every(
			({ shapeExprs: [_, shape] }) =>
				isEmptyProductShape(shape) ||
				shape.annotations === undefined ||
				shape.expression.expressions.some(
					({ predicate }) => predicate === shape.annotations![0].object
				)
		),
	"KeyedSchema"
)

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
