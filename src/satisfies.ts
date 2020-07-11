import {
	TypeOf,
	Type,
	type,
	string,
	literal,
	union,
	exact,
	Context,
	failure,
	success,
	identity,
} from "io-ts/es6/index.js"

import RDF from "rdf-js"

import ShExParser from "@shexjs/parser"

import {
	iriNodeKind,
	literalNodeKind,
	dataType,
	valueSet,
	numericFacet,
	stringFacet,
	objectValue,
	IriStem,
	IriStemRange,
	LiteralStem,
	LiteralStemRange,
	Language,
	LanguageStem,
	LanguageStemRange,
} from "./constraint.js"

import { xsd, rdf } from "./vocab.js"

interface NamedNode<T extends string> extends RDF.NamedNode {
	value: T
}

export interface TypedLiteral<T extends string> extends RDF.Literal {
	datatype: NamedNode<T>
}

function isTypedLiteral<T extends string>(
	node: RDF.Term,
	value: Type<T>
): node is TypedLiteral<T> {
	return node.termType === "Literal" && value.is(node.datatype.value)
}

const typedLiteral = type({
	termType: literal("Literal"),
	value: string,
	language: literal(""),
	datatype: type({ termType: literal("NamedNode"), value: string }),
})

export const TypedLiteral = <T extends string>(
	value: Type<T>
): Type<TypedLiteral<T>, TypedLiteral<T>, RDF.Term> =>
	new Type(
		"TypedLiteral",
		(node: unknown): node is TypedLiteral<T> =>
			typedLiteral.is(node) && value.is(node.datatype.value),
		(input: RDF.Term, context: Context) => {
			return isTypedLiteral(input, value)
				? success(input)
				: failure(input, context)
		},
		identity
	)

const integerPattern = /^[+-]?[0-9]+$/
const decimalPattern = /^[+\-]?(?:[0-9]+(?:\.[0-9]*)?|\.[0-9]+)(?:[eE][+\-]?[0-9]+)?$/

export const integerDatatype = union([
	literal(xsd.integer),
	literal(xsd.positiveInteger),
	literal(xsd.nonPositiveInteger),
	literal(xsd.negativeInteger),
	literal(xsd.nonNegativeInteger),
	literal(xsd.long),
	literal(xsd.int),
	literal(xsd.short),
	literal(xsd.byte),
	literal(xsd.unsignedLong),
	literal(xsd.unsignedInt),
	literal(xsd.unsignedShort),
	literal(xsd.unsignedByte),
])

export const integer: Type<
	TypedLiteral<integerDatatype>,
	TypedLiteral<integerDatatype>,
	RDF.Term
> = TypedLiteral(integerDatatype)

export type integerDatatype = keyof typeof integerRanges

export const integerRanges = Object.freeze({
	[xsd.integer]: [-Infinity, Infinity] as [number, number],
	[xsd.positiveInteger]: [1, Infinity] as [number, number],
	[xsd.nonPositiveInteger]: [-Infinity, 0] as [number, number],
	[xsd.negativeInteger]: [-Infinity, -1] as [number, number],
	[xsd.nonNegativeInteger]: [0, Infinity] as [number, number],
	[xsd.long]: [-9223372036854775808, 9223372036854775807] as [number, number],
	[xsd.int]: [-2147483648, 2147483647] as [number, number],
	[xsd.short]: [-32768, 32767] as [number, number],
	[xsd.byte]: [-128, 127] as [number, number],
	[xsd.unsignedLong]: [0, 18446744073709551615] as [number, number],
	[xsd.unsignedInt]: [0, 4294967295] as [number, number],
	[xsd.unsignedShort]: [0, 65535] as [number, number],
	[xsd.unsignedByte]: [0, 255] as [number, number],
})

export const isInteger = (
	input: unknown
): input is TypedLiteral<integerDatatype> => {
	if (integer.is(input) && integerPattern.test(input.value)) {
		const value = parseInt(input.value)
		const [min, max] = integerRanges[input.datatype.value]
		return min <= value && value <= max
	}
	return false
}

export const encodeInteger = ({
	value,
}: TypedLiteral<integerDatatype>): number => parseInt(value)

export const decimal = TypedLiteral(literal(xsd.decimal))

export type decimalDatatype = typeof xsd.decimal

export const isDecimal = (
	input: unknown
): input is TypedLiteral<decimalDatatype> =>
	decimal.is(input) && decimalPattern.test(input.value)

export const encodeDecimal = ({
	value,
}: TypedLiteral<decimalDatatype>): number => parseFloat(value)

export type floatDatatype = typeof xsd.float

export const float = TypedLiteral(literal(xsd.float))

export const isFloat = (input: unknown): input is TypedLiteral<floatDatatype> =>
	float.is(input) &&
	(input.value === "NaN" ||
		input.value === "INF" ||
		input.value === "-INF" ||
		decimalPattern.test(input.value))

export const encodeFloat = ({ value }: TypedLiteral<floatDatatype>): number =>
	value === "NaN"
		? NaN
		: value === "INF"
		? Infinity
		: value === "-INF"
		? -Infinity
		: parseFloat(value)

export type doubleDatatype = typeof xsd.double

export const double = TypedLiteral(literal(xsd.double))

export const isDouble = (
	input: unknown
): input is TypedLiteral<doubleDatatype> =>
	double.is(input) &&
	(input.value === "NaN" ||
		input.value === "INF" ||
		input.value === "-INF" ||
		decimalPattern.test(input.value))

export const encodeDouble = ({ value }: TypedLiteral<doubleDatatype>): number =>
	value === "NaN"
		? NaN
		: value === "INF"
		? Infinity
		: value === "-INF"
		? -Infinity
		: Number(value)

const totalDigitsPattern = /[0-9]/g
const fractionDigitsPattern = /^[+-]?[0-9]*\.?([0-9]*)$/

function validateNumericFacets(
	node: RDF.Term,
	{
		minexclusive,
		maxexclusive,
		mininclusive,
		maxinclusive,
		fractiondigits,
		totaldigits,
	}: TypeOf<typeof numericFacet>
): boolean {
	let value: number

	if (totaldigits !== undefined || fractiondigits !== undefined) {
		if (isDecimal(node)) {
			value = encodeDecimal(node)
		} else if (isInteger(node)) {
			value = encodeInteger(node)
		} else {
			return false
		}
	} else if (
		minexclusive !== undefined ||
		maxexclusive !== undefined ||
		mininclusive !== undefined ||
		minexclusive !== undefined
	) {
		if (isDecimal(node)) {
			value = encodeDecimal(node)
		} else if (isDouble(node)) {
			value = encodeDouble(node)
		} else if (isFloat(node)) {
			value = encodeFloat(node)
		} else if (isInteger(node)) {
			value = encodeInteger(node)
		} else {
			return false
		}
	} else {
		return true
	}

	let valid = true

	if (valid && minexclusive !== undefined) {
		valid = minexclusive < value
	}

	if (valid && mininclusive !== undefined) {
		valid = mininclusive <= value
	}

	if (valid && maxexclusive !== undefined) {
		valid = value < maxexclusive
	}

	if (valid && maxinclusive !== undefined) {
		valid = value <= maxinclusive
	}

	if (valid && totaldigits !== undefined) {
		const match = node.value.match(totalDigitsPattern)
		valid = match !== null && match.length <= totaldigits
	}

	if (valid && fractiondigits !== undefined) {
		const match = node.value.match(fractionDigitsPattern)
		return match !== null && match[1].length <= fractiondigits
	}

	return valid
}

function validateStringFacets(
	value: string,
	{ length, minlength, maxlength, pattern, flags }: TypeOf<typeof stringFacet>
): boolean {
	let valid = true

	if (valid && length !== undefined) {
		valid = value.length === length
	}

	if (valid && minlength !== undefined) {
		valid = minlength <= value.length
	}

	if (valid && maxlength !== undefined) {
		valid = value.length <= maxlength
	}

	if (valid && pattern !== undefined) {
		valid = new RegExp(pattern, flags).test(value)
	}

	return valid
}

function validateValueSet(
	node: RDF.Term,
	{ values }: TypeOf<typeof valueSet>
): boolean {
	const { value } = node
	return values.some((v) => {
		if (objectValue.is(v)) {
			if (typeof v === "string") {
				return node.termType === "NamedNode" && value === v
			} else if (node.termType !== "Literal" || value !== v.value) {
				return false
			} else if (v.type === undefined || v.type === xsd.string) {
				return node.datatype.value === xsd.string
			} else if (v.type !== node.datatype.value) {
				return false
			} else if (v.type === rdf.langString) {
				return node.language === v.language
			} else {
				return true
			}
		} else if (IriStem.is(v)) {
			return node.termType === "NamedNode" && value.startsWith(v.stem)
		} else if (IriStemRange.is(v)) {
			return (
				node.termType === "NamedNode" &&
				iriOrLiteralStem(value, v.stem) &&
				!v.exclusions.some((e) => iriOrLiteralStem(value, e))
			)
		} else if (node.termType !== "Literal") {
			return false
		} else if (LiteralStem.is(v)) {
			return value.startsWith(v.stem)
		} else if (LiteralStemRange.is(v)) {
			return (
				iriOrLiteralStem(value, v.stem) &&
				!v.exclusions.some((e) => iriOrLiteralStem(value, e))
			)
		} else if (node.datatype.value !== rdf.langString) {
			return false
		} else if (Language.is(v)) {
			return node.language === v.languageTag
		} else if (LanguageStem.is(v)) {
			return languageStem(node.language, v)
		} else if (LanguageStemRange.is(v)) {
			return (
				languageStem(node.language, v.stem) &&
				!v.exclusions.some((e) => languageStem(node.language, e))
			)
		}
	})
}

const iriOrLiteralStem = (
	value: string,
	s:
		| string
		| { type: "Wildcard" }
		| { type: "IriStem" | "LiteralStem"; stem: string }
): boolean =>
	typeof s === "string"
		? value === s
		: s.type === "Wildcard"
		? true
		: value.startsWith(s.stem)

const languageStem = (
	language: string,
	s: string | { type: "Wildcard" } | { type: "LanguageStem"; stem: string }
): boolean => {
	if (typeof s === "string") {
		return language === s
	} else if (s.type === "Wildcard") {
		return true
	} else {
		const l = language.toLowerCase()
		const p = s.stem.toLowerCase()
		return p === "" || l === p || (l.startsWith(p) && l[p.length] === "-")
	}
}

export default function nodeSatisfies(
	node: RDF.Term,
	constraint: ShExParser.NodeConstraint
): boolean {
	if (iriNodeKind.is(constraint)) {
		if (constraint.nodeKind === "iri" && node.termType !== "NamedNode") {
			return false
		}
		return validateStringFacets(node.value, constraint)
	} else if (literalNodeKind.is(constraint)) {
		const { value, termType } = node
		return (
			termType === "Literal" &&
			validateStringFacets(value, constraint) &&
			validateNumericFacets(node, constraint)
		)
	} else if (dataType.is(constraint)) {
		return (
			node.termType === "Literal" &&
			node.datatype.value === constraint.datatype &&
			validateStringFacets(node.value, constraint) &&
			validateNumericFacets(node, constraint)
		)
	} else if (valueSet.is(constraint)) {
		return (
			validateValueSet(node, constraint) &&
			validateStringFacets(node.value, constraint) &&
			validateNumericFacets(node, constraint)
		)
	} else {
		const numeric = exact(numericFacet).decode(constraint)
		if (numeric._tag === "Right" && Object.keys(numeric).length > 0) {
			return validateNumericFacets(node, numeric.right)
		}
		const string = exact(stringFacet).decode(constraint)
		if (string._tag === "Right" && Object.keys(string).length > 0) {
			return validateStringFacets(node.value, string.right)
		}
	}
	return true
}
