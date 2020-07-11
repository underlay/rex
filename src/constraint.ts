import {
	Type,
	TypeOf,
	type,
	partial,
	string,
	number,
	literal,
	array,
	union,
	intersection,
} from "io-ts/es6/index.js"

import ShExParser from "@shexjs/parser"

export const ObjectLiteral = intersection([
	type({ value: string }),
	partial({ language: string, type: string }),
])

export const objectValue = union([string, ObjectLiteral])

export const Wildcard = type({ type: literal("Wildcard") })

export const IriStem = type({ type: literal("IriStem"), stem: string })

export const IriStemRange = type({
	type: literal("IriStemRange"),
	stem: union([string, Wildcard]),
	exclusions: array(union([string, IriStem])),
})

export const LiteralStem = type({
	type: literal("LiteralStem"),
	stem: string,
})

export const LiteralStemRange = type({
	type: literal("LiteralStemRange"),
	stem: union([string, Wildcard]),
	exclusions: array(union([string, LiteralStem])),
})

export const Language = type({
	type: literal("Language"),
	languageTag: string,
})

export const LanguageStem = type({
	type: literal("LanguageStem"),
	stem: string,
})

export const LanguageStemRange = type({
	type: literal("LanguageStemRange"),
	stem: union([string, Wildcard]),
	exclusions: array(union([string, LanguageStem])),
})

export const valueSetValue = union([
	objectValue,
	IriStem,
	IriStemRange,
	LiteralStem,
	LiteralStemRange,
	Language,
	LanguageStem,
	LanguageStemRange,
])

export const lengthFacet = partial({ length: number })

export const lengthRangeFacet = partial({
	minlength: number,
	maxlength: number,
})

export const patternFacet = intersection([
	partial({ pattern: string }),
	partial({ flags: string }),
])

export const stringFacet = intersection([
	lengthFacet,
	lengthRangeFacet,
	patternFacet,
])

export const numericFacet = partial({
	mininclusive: number,
	minexclusive: number,
	maxinclusive: number,
	maxexclusive: number,
	totaldigits: number,
	fractiondigits: number,
})

export const xsFacet = intersection([stringFacet, numericFacet])

export const iriNodeKind = intersection([
	type({ type: literal("NodeConstraint"), nodeKind: literal("iri") }),
	stringFacet,
])

export const literalNodeKind = intersection([
	type({ type: literal("NodeConstraint"), nodeKind: literal("literal") }),
	xsFacet,
])

export type dataTypeConstraint<T extends string> = {
	type: "NodeConstraint"
	datatype: T
} & TypeOf<typeof xsFacet>

export const dataTypeConstraint = <T extends string>(
	datatype: Type<T>
): Type<dataTypeConstraint<T>> =>
	intersection([type({ type: literal("NodeConstraint"), datatype }), xsFacet])

export const dataType = dataTypeConstraint(string)

export const valueSet = intersection([
	type({ type: literal("NodeConstraint"), values: array(valueSetValue) }),
	xsFacet,
])

export const NodeConstraint: Type<ShExParser.NodeConstraint> = union([
	iriNodeKind,
	literalNodeKind,
	dataType,
	valueSet,
	intersection([type({ type: literal("NodeConstraint") }), stringFacet]),
	intersection([type({ type: literal("NodeConstraint") }), numericFacet]),
])
