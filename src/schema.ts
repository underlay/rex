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

import { integerDatatype } from "./satisfies.js"

import { NodeConstraint, dataTypeConstraint } from "./constraint.js"
import { rdf, rex, xsd } from "./vocab.js"

export const lexicographic = union([literal(rex.first), literal(rex.last)])

export const numeric = union([literal(rex.greatest), literal(rex.least)])
export const temporal = union([literal(rex.earliest), literal(rex.latest)])
export const boolean = union([literal(rex.all), literal(rex.any)])

interface annotation<P extends string, T extends string> {
	type: "Annotation"
	predicate: P
	object: T
}

const annotation = <P extends string, T extends string>(
	predicate: Type<P>,
	object: Type<T>
): Type<annotation<P, T>> =>
	type({ type: literal("Annotation"), predicate, object })

const metaAnnotation = annotation(literal(rex.meta), string)
const withAnnotation = annotation(literal(rex.with), string)
const keyAnnotation = annotation(literal(rex.key), string)

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

export type datatypeAnnotation<T extends string, S extends string> = {
	valueExpr: dataTypeConstraint<T>
	annotations: [annotation<typeof rex.sort, S>]
}

export type numericDatatype =
	| TypeOf<typeof integerDatatype>
	| typeof xsd.double
	| typeof xsd.decimal
	| typeof xsd.float

export type sortNumeric = datatypeAnnotation<
	numericDatatype,
	TypeOf<typeof numeric>
>

export type temporalDatatype = typeof xsd.dateTime | typeof xsd.date

export type sortTemporal = datatypeAnnotation<
	temporalDatatype,
	TypeOf<typeof temporal>
>

export type booleanDatatype = typeof xsd.boolean

export type sortBoolean = datatypeAnnotation<
	booleanDatatype,
	TypeOf<typeof boolean>
>

export type sortLexicographic = {
	valueExpr?: shapeExpr
	annotations?: [annotation<typeof rex.sort, TypeOf<typeof lexicographic>>]
}

type sortDatatypeAnnotation =
	| sortNumeric
	| sortTemporal
	| sortBoolean
	| sortLexicographic

type tripleConstraintAnnotation =
	| sortDatatypeAnnotation
	| sortWith
	| sortMeta
	| sortWithMeta

export type sortWith = {
	valueExpr?: shapeExpr
	annotations: [annotation<typeof rex.with, string>]
}

export type sortMeta = {
	valueExpr?: shapeExpr
	annotations: [annotation<typeof rex.meta, string>]
}

export type sortWithMeta = {
	valueExpr?: shapeExpr
	annotations: [
		annotation<typeof rex.meta, string>,
		annotation<typeof rex.with, string>
	]
}

export function isNumeric(
	tripleConstraint: tripleConstraintAnnotation
): tripleConstraint is sortNumeric {
	if (
		tripleConstraint.annotations === undefined ||
		tripleConstraint.annotations.length !== 1
	) {
		return false
	} else {
		const [{ object }] = tripleConstraint.annotations
		return numeric.is(object)
	}
}

export function isTemporal(
	tripleConstraint: tripleConstraintAnnotation
): tripleConstraint is sortTemporal {
	if (
		tripleConstraint.annotations === undefined ||
		tripleConstraint.annotations.length !== 1
	) {
		return false
	} else {
		const [{ object }] = tripleConstraint.annotations
		return temporal.is(object)
	}
}

export function isBoolean(
	tripleConstraint: tripleConstraintAnnotation
): tripleConstraint is sortBoolean {
	if (
		tripleConstraint.annotations === undefined ||
		tripleConstraint.annotations.length !== 1
	) {
		return false
	} else {
		const [{ object }] = tripleConstraint.annotations
		return boolean.is(object)
	}
}

export function isDatatypeAnnotation(
	tripleConstraint: AnnotatedTripleConstraint
): tripleConstraint is baseTripleConstraint &
	(sortNumeric | sortTemporal | sortBoolean) {
	if (tripleConstraint.annotations === undefined) {
		return false
	}
	const [{ object }] = tripleConstraint.annotations
	return numeric.is(object) || temporal.is(object) || boolean.is(object)
}

export function isWithAnnotation(
	tripleConstraint: AnnotatedTripleConstraint
): tripleConstraint is baseTripleConstraint & sortWith {
	return (
		tripleConstraint.annotations !== undefined &&
		tripleConstraint.annotations.length === 1 &&
		tripleConstraint.annotations[0].predicate === rex.with
	)
}

export function isMetaAnnotation(
	tripleConstraint: AnnotatedTripleConstraint
): tripleConstraint is baseTripleConstraint & (sortMeta | sortWithMeta) {
	return (
		tripleConstraint.annotations !== undefined &&
		tripleConstraint.annotations[0].predicate === rex.meta
	)
}

export type baseTripleConstraint = {
	type: "TripleConstraint"
	predicate: string
	inverse?: false
	min?: number
	max?: number
}

export type AnnotatedTripleConstraint = baseTripleConstraint &
	tripleConstraintAnnotation

export type TripleConstraint = baseTripleConstraint & { valueExpr?: shapeExpr }

const lexicographicAnnotation = annotation(literal(rex.sort), lexicographic),
	numericAnnotation = annotation(literal(rex.sort), numeric),
	temporalAnnotation = annotation(literal(rex.sort), temporal),
	booleanAnnotation = annotation(literal(rex.sort), boolean)

const TripleConstraint: Type<AnnotatedTripleConstraint> = recursion(
	"TripleConstraint",
	() =>
		intersection([
			type({
				type: literal("TripleConstraint"),
				predicate: string,
			}),
			partial({
				valueExpr: shapeExpr,
				inverse: literal(false),
				min: number,
				max: number,
			}),
			union([
				type({ annotations: tuple([metaAnnotation, withAnnotation]) }),
				type({ annotations: tuple([metaAnnotation]) }),
				type({ annotations: tuple([withAnnotation]) }),
				type({
					valueExpr: dataTypeConstraint(
						union([
							literal(xsd.double),
							literal(xsd.decimal),
							literal(xsd.float),
							integerDatatype,
						])
					),
					annotations: tuple([numericAnnotation]),
				}),
				type({
					valueExpr: dataTypeConstraint(
						union([literal(xsd.date), literal(xsd.dateTime)])
					),
					annotations: tuple([temporalAnnotation]),
				}),
				type({
					valueExpr: dataTypeConstraint(literal(xsd.boolean)),
					annotations: tuple([booleanAnnotation]),
				}),
				partial({
					annotations: tuple([lexicographicAnnotation]),
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

const tripleConstraints = array(TripleConstraint)
const UniqueTripleConstraints = new Type<UniqueTripleConstraints>(
	"UniqueTripleConstraints",
	(input: unknown): input is UniqueTripleConstraints => {
		if (tripleConstraints.is(input) && input.length > 1) {
			const predicates = new Set(input.map((c) => c.predicate))
			return predicates.size === input.length
		}
		return false
	},
	(input, context) => {
		const result = tripleConstraints.validate(input, context)
		if (result._tag === "Right" && result.right.length > 1) {
			const { size } = new Set(result.right.map((c) => c.predicate))
			if (size === result.right.length) {
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
	predicate: literal(rdf.type),
	valueExpr: type({
		type: literal("NodeConstraint"),
		values: tuple([string]),
	}),
})

type TypedTripleConstraints = [
	TypeOf<typeof typedTripleConstraint>,
	AnnotatedTripleConstraint,
	...AnnotatedTripleConstraint[]
]

const TypedTripleConstraints = new Type<TypedTripleConstraints>(
	"TypedTripleConstraints",
	(input: unknown): input is TypedTripleConstraints => {
		if (
			UniqueTripleConstraints.is(input) &&
			typedTripleConstraint.is(input[0])
		) {
			for (const tripleConstraint of input.slice(1)) {
				if (isWithAnnotation(tripleConstraint)) {
					const [{ object }] = tripleConstraint.annotations
					if (object !== tripleConstraint.predicate) {
						const match = input.find(({ predicate }) => predicate === object)
						if (match === undefined) {
							return false
						}
					}
				}
			}
			return true
		}
		return false
	},
	(input, context) => {
		const result = UniqueTripleConstraints.validate(input, context)
		if (result._tag === "Right") {
			const [one] = result.right
			const typed = typedTripleConstraint.validate(one, context)
			if (typed._tag === "Right") {
				for (const tripleConstraint of result.right) {
					if (isWithAnnotation(tripleConstraint)) {
						const [{ object }] = tripleConstraint.annotations
						if (object !== tripleConstraint.predicate) {
							const match = result.right.find(
								({ predicate }) => predicate === object
							)
							if (match === undefined) {
								return failure(input, context)
							}
						}
					}
				}
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
	readonly Keyed: unique symbol
}

export const Schema = brand(
	schema,
	(s): s is Branded<TypeOf<typeof schema>, KeyedSchemaBrand> => {
		for (const {
			shapeExprs: [_, shape],
		} of s.shapes) {
			if (isEmptyProductShape(shape) || shape.annotations === undefined) {
				continue
			}
			const [{ object }] = shape.annotations
			const key = shape.expression.expressions.find(
				({ predicate }) => predicate === object
			)
			if (key === undefined) {
				return false
			}
			for (const tripleConstraint of shape.expression.expressions) {
				const valid = checkMetaAnnotations(s, tripleConstraint)
				if (!valid) {
					return false
				}
			}
		}
		return true
	},
	"Keyed"
)

function checkMetaAnnotations(
	s: TypeOf<typeof schema>,
	tripleConstraint: TripleConstraint
): boolean {
	if (isMetaAnnotation(tripleConstraint)) {
		const {
			valueExpr,
			annotations: [{ object }, withReference],
		} = tripleConstraint
		const match = s.shapes.find(({ id }) => object === id)
		if (match === undefined) {
			return false
		}
		if (withReference !== undefined) {
			const {
				shapeExprs: [_, { expression }],
			} = match
			if (expression.type === "TripleConstraint") {
				return false
			}
			const reference = expression.expressions.find(
				({ predicate }) => predicate === withReference.object
			)
			if (
				reference === undefined ||
				isWithAnnotation(reference) ||
				isMetaAnnotation(reference)
			) {
				return false
			}
		}
		if (
			valueExpr !== undefined &&
			typeof valueExpr !== "string" &&
			valueExpr.type !== "NodeConstraint"
		) {
			const [_, shape] = getShape(valueExpr)
			for (const expression of getExpressions(shape)) {
				checkMetaAnnotations(s, expression)
			}
		}
	}
	return true
}

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

export const getShape = (
	shape: Shape | ShapeAnd
): [ShExParser.NodeConstraint | null, Shape] =>
	shape.type === "ShapeAnd" ? shape.shapeExprs : [null, shape]
