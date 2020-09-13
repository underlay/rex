import t from "./io.js"

// import intersection from "io-ts/"

import * as ShExParser from "@shexjs/parser"

export const ObjectLiteral = t.intersection([
	t.type({ value: t.string }),
	t.partial({ language: t.string, type: t.string }),
])

export const objectValue = t.union([t.string, ObjectLiteral])

export const Wildcard = t.type({ type: t.literal("Wildcard") })

export const IriStem = t.type({ type: t.literal("IriStem"), stem: t.string })

export const IriStemRange = t.type({
	type: t.literal("IriStemRange"),
	stem: t.union([t.string, Wildcard]),
	exclusions: t.array(t.union([t.string, IriStem])),
})

export const LiteralStem = t.type({
	type: t.literal("LiteralStem"),
	stem: t.string,
})

export const LiteralStemRange = t.type({
	type: t.literal("LiteralStemRange"),
	stem: t.union([t.string, Wildcard]),
	exclusions: t.array(t.union([t.string, LiteralStem])),
})

export const Language = t.type({
	type: t.literal("Language"),
	languageTag: t.string,
})

export const LanguageStem = t.type({
	type: t.literal("LanguageStem"),
	stem: t.string,
})

export const LanguageStemRange = t.type({
	type: t.literal("LanguageStemRange"),
	stem: t.union([t.string, Wildcard]),
	exclusions: t.array(t.union([t.string, LanguageStem])),
})

export const valueSetValue = t.union([
	objectValue,
	IriStem,
	IriStemRange,
	LiteralStem,
	LiteralStemRange,
	Language,
	LanguageStem,
	LanguageStemRange,
])

export const lengthFacet = t.partial({ length: t.number })

export const lengthRangeFacet = t.partial({
	minlength: t.number,
	maxlength: t.number,
})

export const patternFacet = t.intersection([
	t.partial({ pattern: t.string }),
	t.partial({ flags: t.string }),
])

export const stringFacet = t.intersection([
	lengthFacet,
	lengthRangeFacet,
	patternFacet,
])

export const numericFacet = t.partial({
	mininclusive: t.number,
	minexclusive: t.number,
	maxinclusive: t.number,
	maxexclusive: t.number,
	totaldigits: t.number,
	fractiondigits: t.number,
})

export const xsFacet = t.intersection([stringFacet, numericFacet])

export const iriNodeKind = t.intersection([
	t.type({ type: t.literal("NodeConstraint"), nodeKind: t.literal("iri") }),
	stringFacet,
])

export const literalNodeKind = t.intersection([
	t.type({ type: t.literal("NodeConstraint"), nodeKind: t.literal("literal") }),
	xsFacet,
])

export type dataTypeConstraint<T extends string> = {
	type: "NodeConstraint"
	datatype: T
} & t.TypeOf<typeof xsFacet>

export const dataTypeConstraint = <T extends string>(
	datatype: t.Type<T>
): t.Type<dataTypeConstraint<T>> =>
	t.intersection([
		t.type({ type: t.literal("NodeConstraint"), datatype }),
		xsFacet,
	])

export const dataType = dataTypeConstraint(t.string)

export const valueSet = t.intersection([
	t.type({ type: t.literal("NodeConstraint"), values: t.array(valueSetValue) }),
	xsFacet,
])

export const NodeConstraint: t.Type<ShExParser.NodeConstraint> = t.union([
	iriNodeKind,
	literalNodeKind,
	dataType,
	valueSet,
	t.intersection([t.type({ type: t.literal("NodeConstraint") }), stringFacet]),
	t.intersection([t.type({ type: t.literal("NodeConstraint") }), numericFacet]),
])
