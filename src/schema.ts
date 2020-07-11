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
	tuple,
	failure,
	identity,
	brand,
	Branded,
	Context,
	Errors,
	success,
} from "io-ts/es6/index.js"

import { Right } from "fp-ts/lib/Either.js"
import ShExParser from "@shexjs/parser"

import { rdf, rex, xsd } from "./vocab.js"
import { integerDatatype } from "./satisfies.js"
import { NodeConstraint, dataTypeConstraint } from "./constraint.js"
import { Either } from "fp-ts/es6/Either"

export const lexicographic = union([literal(rex.first), literal(rex.last)]),
	numeric = union([literal(rex.greatest), literal(rex.least)]),
	temporal = union([literal(rex.earliest), literal(rex.latest)]),
	boolean = union([literal(rex.all), literal(rex.any)])

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
const inAnnotation = annotation(literal(rex.in), string)

const sortAnnotation = annotation(
	literal(rex.sort),
	union([numeric, temporal, boolean, lexicographic])
)

type nodeConstraint = Extract<
	ShExParser.NodeConstraint,
	{ nodeKind: "iri" } | ShExParser.literalNodeConstraint
>

export type shapeExpr = string | nodeConstraint

export const shapeExpr: Type<shapeExpr> = union([string, NodeConstraint])

export const isDataTypeConstraint = (
	valueExpr: shapeExpr
): valueExpr is dataTypeConstraint<string> =>
	typeof valueExpr !== "string" && valueExpr.hasOwnProperty("datatype")

export type datatypeAnnotation<T extends string, S extends string> = {
	valueExpr: dataTypeConstraint<T>
	annotations:
		| [annotation<typeof rex.sort, S>]
		| [annotation<typeof rex.sort, S>, annotation<typeof rex.in, string>]
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
	annotations?:
		| [annotation<typeof rex.sort, TypeOf<typeof lexicographic>>]
		| [
				annotation<typeof rex.sort, TypeOf<typeof lexicographic>>,
				annotation<typeof rex.in, string>
		  ]
}

export type sortDatatypeAnnotation =
	| sortNumeric
	| sortTemporal
	| sortBoolean
	| sortLexicographic

type tripleConstraintAnnotation =
	| sortDatatypeAnnotation
	| sortReference
	| sortMetaReference

export type sortReference = {
	annotations:
		| [annotation<typeof rex.with, string>, sortAnnotation]
		| [
				annotation<typeof rex.with, string>,
				sortAnnotation,
				annotation<typeof rex.in, string>
		  ]
}

export type sortMetaReference = {
	annotations: [
		annotation<typeof rex.meta, string>,
		sortAnnotation,
		annotation<typeof rex.in, string>
	]
}

type sortAnnotation = annotation<
	typeof rex.sort,
	TypeOf<
		typeof numeric | typeof temporal | typeof boolean | typeof lexicographic
	>
>

export function isNumeric(
	tripleConstraint: AnnotatedTripleConstraint
): tripleConstraint is TripleConstraint & sortNumeric {
	if (tripleConstraint.annotations === undefined) {
		return false
	}
	const [{ predicate, object }] = tripleConstraint.annotations
	return predicate === rex.sort && numeric.is(object)
}

export function isTemporal(
	tripleConstraint: AnnotatedTripleConstraint
): tripleConstraint is TripleConstraint & sortTemporal {
	if (tripleConstraint.annotations === undefined) {
		return false
	}
	const [{ predicate, object }] = tripleConstraint.annotations
	return predicate === rex.sort && temporal.is(object)
}

export function isBoolean(
	tripleConstraint: AnnotatedTripleConstraint
): tripleConstraint is TripleConstraint & sortBoolean {
	if (tripleConstraint.annotations === undefined) {
		return false
	}
	const [{ predicate, object }] = tripleConstraint.annotations
	return predicate === rex.sort && boolean.is(object)
}

export function isDatatypeAnnotation(
	tripleConstraint: AnnotatedTripleConstraint
): tripleConstraint is TripleConstraint &
	(sortNumeric | sortTemporal | sortBoolean) {
	if (tripleConstraint.annotations === undefined) {
		return false
	}
	const [{ predicate, object }] = tripleConstraint.annotations
	return (
		predicate === rex.sort &&
		(numeric.is(object) || temporal.is(object) || boolean.is(object))
	)
}

export const isReferenceAnnotation = (
	tripleConstraint: AnnotatedTripleConstraint
): tripleConstraint is TripleConstraint & sortReference =>
	tripleConstraint.annotations !== undefined &&
	tripleConstraint.annotations.length > 1 &&
	tripleConstraint.annotations[0].predicate === rex.with &&
	tripleConstraint.annotations[1]!.predicate === rex.sort

export const isMetaReferenceAnnotation = (
	tripleConstraint: AnnotatedTripleConstraint
): tripleConstraint is TripleConstraint & sortMetaReference =>
	tripleConstraint.annotations !== undefined &&
	tripleConstraint.annotations.length > 2 &&
	tripleConstraint.annotations[0].predicate === rex.meta &&
	tripleConstraint.annotations[1]!.predicate === rex.sort &&
	tripleConstraint.annotations[2]!.predicate === rex.in

export type TripleConstraint = {
	type: "TripleConstraint"
	predicate: string
	valueExpr: shapeExpr
	inverse?: false
	min?: number
	max?: number
}

export type AnnotatedTripleConstraint = TripleConstraint &
	tripleConstraintAnnotation

const lexicographicAnnotation = annotation(literal(rex.sort), lexicographic),
	numericAnnotation = annotation(literal(rex.sort), numeric),
	temporalAnnotation = annotation(literal(rex.sort), temporal),
	booleanAnnotation = annotation(literal(rex.sort), boolean)

const wrap = <T extends annotation<typeof rex.sort, string>>(s: Type<T>) =>
	union([tuple([s]), tuple([s, inAnnotation])])

export const numericValueExpr = dataTypeConstraint(
		union([
			literal(xsd.double),
			literal(xsd.decimal),
			literal(xsd.float),
			integerDatatype,
		])
	),
	temporalValueExpr = dataTypeConstraint(
		union([literal(xsd.date), literal(xsd.dateTime)])
	),
	booleanValueExpr = dataTypeConstraint(literal(xsd.boolean))

const tripleConstraint = intersection([
	type({
		type: literal("TripleConstraint"),
		predicate: string,
		valueExpr: shapeExpr,
	}),
	partial({
		inverse: literal(false),
		min: number,
		max: number,
		annotations: array(annotation(string, string)),
	}),
])

const TripleConstraint: Type<AnnotatedTripleConstraint> = new Type(
	"AnnotatedTripleConstraint",
	(input: unknown): input is AnnotatedTripleConstraint => {
		if (!tripleConstraint.is(input)) {
			return false
		}
		return true
	},
	(
		input: unknown,
		context: Context
	): Either<Errors, AnnotatedTripleConstraint> => {
		if (tripleConstraint.is(input)) {
			if (input.annotations !== undefined) {
				const predicates = input.annotations.map(({ predicate }) => predicate)
				const [a, b, c] = input.annotations
				if (a.predicate === rex.in) {
					if (input.annotations.length > 1) {
						const extra = predicates.slice(1).join(", ")
						return failure(input, context, `Extraneous annotations ${extra}`)
					}
				} else if (a.predicate === rex.sort) {
					if (!matchesSort(input.valueExpr, a.object)) {
						return failure(
							input,
							context,
							`Sort annotation ${a.object} does not apply to the given value expression`
						)
					} else if (b !== undefined && b.predicate !== rex.in) {
						const extra = predicates.slice(1).join(", ")
						return failure(input, context, `Extraneous annotations ${extra}`)
					} else if (c !== undefined) {
						const extra = predicates.slice(2).join(", ")
						return failure(input, context, `Extraneous annotations ${extra}`)
					}
				} else if (a.predicate === rex.with) {
					if (b === undefined || b.predicate !== rex.sort) {
						return failure(
							input,
							context,
							`Sorting with rex:with requires an explicit rex:sort annotation`
						)
					} else if (c !== undefined && c.predicate !== rex.in) {
						const extra = predicates.slice(2).join(", ")
						return failure(input, context, `Extraneous annotations ${extra}`)
					}
				} else if (a.predicate === rex.meta) {
					if (b === undefined || b.predicate !== rex.sort) {
						return failure(
							input,
							context,
							`Sorting with rex:meta requires an explicit rex:sort annotation`
						)
					} else if (c === undefined || c.predicate !== rex.in) {
						return failure(
							input,
							context,
							`Sorting with rex:meta requires an explicit rex:in annotation`
						)
					}
				} else {
					const extra = predicates.join(", ")
					return failure(input, context, `Extraneous annotations ${extra}`)
				}
			}
			return success(input as AnnotatedTripleConstraint)
		} else {
			return failure(input, context, "Invalid TripleConstraint")
		}
	},
	identity
)

// const TripleConstraint: Type<AnnotatedTripleConstraint> = intersection([
// 	type({
// 		type: literal("TripleConstraint"),
// 		predicate: string,
// 		valueExpr: shapeExpr,
// 	}),
// 	partial({
// 		inverse: literal(false),
// 		min: number,
// 		max: number,
// 	}),
// 	union([
// 		type({
// 			annotations: union([
// 				tuple([withAnnotation, sortAnnotation]),
// 				tuple([withAnnotation, sortAnnotation, inAnnotation]),
// 			]),
// 		}),
// 		type({
// 			annotations: tuple([metaAnnotation, sortAnnotation, inAnnotation]),
// 		}),
// 		type({
// 			valueExpr: numericValueExpr,
// 			annotations: wrap(numericAnnotation),
// 		}),
// 		type({
// 			valueExpr: temporalValueExpr,
// 			annotations: wrap(temporalAnnotation),
// 		}),
// 		type({
// 			valueExpr: booleanValueExpr,
// 			annotations: wrap(booleanAnnotation),
// 		}),
// 		partial({
// 			annotations: wrap(lexicographicAnnotation),
// 		}),
// 	]),
// ])

const tripleConstraints = array(TripleConstraint)

const typedTripleConstraint = type({
	type: literal("TripleConstraint"),
	predicate: literal(rdf.type),
	valueExpr: type({
		type: literal("NodeConstraint"),
		values: tuple([string]),
	}),
})

type TypedTripleConstraint = TypeOf<typeof typedTripleConstraint>

type TypedTripleConstraints = [
	TypedTripleConstraint,
	AnnotatedTripleConstraint,
	...AnnotatedTripleConstraint[]
]

const TypedTripleConstraints = new Type<TypedTripleConstraints>(
	"TypedTripleConstraints",
	(input: unknown): input is TypedTripleConstraints => {
		if (!tripleConstraints.is(input) || input.length < 2) {
			return false
		}
		if (!typedTripleConstraint.is(input[0])) {
			return false
		}
		const predicates = new Set(input.map((c) => c.predicate))
		if (predicates.size !== input.length) {
			return false
		}
		for (const tripleConstraint of input.slice(1)) {
			if (isReferenceAnnotation(tripleConstraint)) {
				const [{ object }] = tripleConstraint.annotations
				if (object !== tripleConstraint.predicate) {
					const match = input.find(({ predicate }) => predicate === object)
					if (match === undefined || typeof match.valueExpr === "string") {
						return false
					}
				}
			}
		}

		return true
	},
	(input, context) => {
		const result = tripleConstraints.validate(input, context)
		if (result._tag === "Left") {
			return result
		}

		const [one] = result.right
		const typed = typedTripleConstraint.validate(one, context)
		if (typed._tag === "Left") {
			return failure(
				input,
				context,
				"The first field of a shape must have predicate rdf:type and have a fixed single value"
			)
		}

		const predicates = new Set(result.right.map((c) => c.predicate))
		if (predicates.size !== result.right.length) {
			return failure(
				input,
				context,
				"No two fields in the same shape can have the same predicate"
			)
		}

		for (const tripleConstraint of result.right) {
			if (isReferenceAnnotation(tripleConstraint)) {
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
	},
	identity
)

const emptyProductShape = type({
	type: literal("Shape"),
	expression: typedTripleConstraint,
})

const productShape = type({
	type: literal("Shape"),
	expression: type({
		type: literal("EachOf"),
		expressions: TypedTripleConstraints,
	}),
})

export const product = union([
	emptyProductShape,
	intersection([
		productShape,
		partial({ annotations: tuple([keyAnnotation]) }),
	]),
])

// export const product = intersection([
// 	union([emptyProductShape, productShape]),
// 	partial({ annotations: tuple([keyAnnotation]) }),
// ])

export const isEmptyProductShape = (
	shape: TypeOf<typeof product>
): shape is TypeOf<typeof emptyProductShape> =>
	shape.expression.type === "TripleConstraint"

const shapeAnd = type({
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

const schema = type({
	type: literal("Schema"),
	shapes: array(shapeAnd),
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
			const { expressions } = shape.expression
			const [{ object }] = shape.annotations
			const key = expressions.find(({ predicate }) => predicate === object)
			if (key === undefined) {
				return false
			}
			for (const tripleConstraint of expressions) {
				if (isReferenceAnnotation(tripleConstraint)) {
					const [
						{ object: ref },
						{ object: sort },
						graph,
					] = tripleConstraint.annotations
					const expression = expressions.find(
						({ predicate }) => ref === predicate
					)
					if (expression === undefined) {
						return false
					} else if (expression === tripleConstraint) {
						return false
					} else if (!matchesSort(expression.valueExpr, sort)) {
						return false
					} else if (!checkGraph(graph, s)) {
						return false
					}
				} else if (isMetaReferenceAnnotation(tripleConstraint)) {
					const [
						{ object: meta },
						{ object: sort },
						{ object: graph },
					] = tripleConstraint.annotations
					const match = s.shapes.find(({ id }) => id === graph)
					if (match === undefined) {
						return false
					}

					const [_, shape] = match.shapeExprs
					const expression = getExpressions(shape).find(
						({ predicate }) => predicate === meta
					)

					if (expression === undefined) {
						return false
					} else if (
						typeof expression.valueExpr === "string" ||
						!matchesSort(expression.valueExpr, sort)
					) {
						return false
					}
				}
			}
		}
		return true
	},
	"Keyed"
)

function matchesSort(valueExpr: shapeExpr, sort: string): boolean {
	if (numeric.is(sort)) {
		return numericValueExpr.is(valueExpr)
	} else if (temporal.is(sort)) {
		return temporalValueExpr.is(valueExpr)
	} else if (boolean.is(sort)) {
		return booleanValueExpr.is(valueExpr)
	} else if (lexicographic.is(sort)) {
		return typeof valueExpr !== "string"
	} else {
		return false
	}
}

const checkGraph = (
	graph: annotation<typeof rex.in, string> | undefined,
	s: TypeOf<typeof schema>
) => graph === undefined || s.shapes.some(({ id }) => id === graph.object)

export const getExpressions = (
	shape: TypeOf<typeof product>
): [TypedTripleConstraint, ...AnnotatedTripleConstraint[]] =>
	shape.expression.type === "EachOf"
		? shape.expression.expressions
		: [shape.expression]
