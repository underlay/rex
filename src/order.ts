import * as RDF from "rdf-js"
import { rex, xsd, defaultSort } from "./vocab.js"
import {
	encodeFloat,
	encodeDecimal,
	encodeDouble,
	TypedLiteral,
	encodeInteger,
	integerDatatype,
} from "./satisfies.js"
import {
	TripleConstraint,
	sortLexicographic,
	sortDatatypeAnnotation,
	isNumeric,
	isTemporal,
	isBoolean,
	numeric,
	numericDatatype,
	AnnotatedTripleConstraint,
	temporalDatatype,
	booleanDatatype,
} from "./schema.js"

import { TypeOf } from "io-ts/es6/index.js"

export type Order = (a: RDF.Term, b: RDF.Term) => boolean

const numericInteger = {
	[rex.greatest]: (
		a: TypedLiteral<integerDatatype>,
		b: TypedLiteral<integerDatatype>
	) => encodeInteger(a) > encodeInteger(b),
	[rex.least]: (
		a: TypedLiteral<integerDatatype>,
		b: TypedLiteral<integerDatatype>
	) => encodeInteger(a) < encodeInteger(b),
}

const numericDecimal = {
	[rex.greatest]: (
		a: TypedLiteral<typeof xsd.decimal>,
		b: TypedLiteral<typeof xsd.decimal>
	) => encodeDecimal(a) > encodeDecimal(b),
	[rex.least]: (
		a: TypedLiteral<typeof xsd.decimal>,
		b: TypedLiteral<typeof xsd.decimal>
	) => encodeDecimal(a) < encodeDecimal(b),
}

const numericDouble = {
	[rex.greatest]: (
		a: TypedLiteral<typeof xsd.double>,
		b: TypedLiteral<typeof xsd.double>
	) => encodeDouble(a) > encodeDouble(b),
	[rex.least]: (
		a: TypedLiteral<typeof xsd.double>,
		b: TypedLiteral<typeof xsd.double>
	) => encodeDouble(a) < encodeDouble(b),
}

const numericFloat = {
	[rex.greatest]: (
		a: TypedLiteral<typeof xsd.float>,
		b: TypedLiteral<typeof xsd.float>
	) => encodeFloat(a) > encodeFloat(b),
	[rex.least]: (
		a: TypedLiteral<typeof xsd.float>,
		b: TypedLiteral<typeof xsd.float>
	) => encodeFloat(a) < encodeFloat(b),
}

function getNumericOrder<T extends numericDatatype>(
	sort: TypeOf<typeof numeric>,
	datatype: T
): Order {
	if (datatype === xsd.decimal) {
		return numericDecimal[sort] as Order
	} else if (datatype === xsd.double) {
		return numericDouble[sort] as Order
	} else if (datatype === xsd.float) {
		return numericFloat[sort] as Order
	} else {
		return numericInteger[sort] as Order
	}
}

const temporal = {
	[rex.earliest]: (
		a: TypedLiteral<typeof xsd.date | typeof xsd.dateTime>,
		b: TypedLiteral<typeof xsd.date | typeof xsd.dateTime>
	) => new Date(a.value) < new Date(b.value),
	[rex.latest]: (
		a: TypedLiteral<typeof xsd.date | typeof xsd.dateTime>,
		b: TypedLiteral<typeof xsd.date | typeof xsd.dateTime>
	) => new Date(a.value) > new Date(b.value),
}

const boolean = {
	[rex.all]: (
		a: TypedLiteral<typeof xsd.boolean>,
		b: TypedLiteral<typeof xsd.boolean>
	) => a.value === "true" && b.value === "true",
	[rex.any]: (
		a: TypedLiteral<typeof xsd.boolean>,
		b: TypedLiteral<typeof xsd.boolean>
	) => a.value === "true" || b.value === "true",
}

const lexicographic = {
	[rex.first]: ({ value: a }: RDF.Term, { value: b }: RDF.Term) => a < b,
	[rex.last]: ({ value: a }: RDF.Term, { value: b }: RDF.Term) => b < a,
}

;(window as any).lex = lexicographic

export function getLexicographicOrder(
	tripleConstraint: TripleConstraint & sortLexicographic
): Order {
	const sort =
		tripleConstraint.annotations === undefined
			? defaultSort
			: tripleConstraint.annotations[0].object

	return lexicographic[sort]
}

type First<T> = T extends [infer F, ...any[]] ? F : never

export function getOrder(
	sort: First<NonNullable<sortDatatypeAnnotation["annotations"]>>["object"],
	datatype: numericDatatype | temporalDatatype | booleanDatatype | null
): Order {
	if (sort === rex.first || sort === rex.last) {
		return lexicographic[sort] as Order
	} else if (sort === rex.earliest || sort === rex.latest) {
		return temporal[sort] as Order
	} else if (sort === rex.all || sort === rex.any) {
		return boolean[sort] as Order
	} else if (datatype === xsd.decimal) {
		return numericDecimal[sort] as Order
	} else if (datatype === xsd.double) {
		return numericDouble[sort] as Order
	} else if (datatype === xsd.float) {
		return numericFloat[sort] as Order
	} else {
		return numericInteger[sort] as Order
	}
}

export function getTypeOrder(
	tripleConstraint: AnnotatedTripleConstraint
): Order {
	if (isNumeric(tripleConstraint)) {
		const {
			valueExpr: { datatype },
			annotations: [{ object: sort }],
		} = tripleConstraint
		if (datatype === xsd.decimal) {
			return numericDecimal[sort] as Order
		} else if (datatype === xsd.double) {
			return numericDouble[sort] as Order
		} else if (datatype === xsd.float) {
			return numericFloat[sort] as Order
		} else {
			return numericInteger[sort] as Order
		}
	} else if (isTemporal(tripleConstraint)) {
		const {
			annotations: [{ object: sort }],
		} = tripleConstraint
		return temporal[sort] as Order
	} else if (isBoolean(tripleConstraint)) {
		const {
			annotations: [{ object: sort }],
		} = tripleConstraint
		return boolean[sort] as Order
	} else if (
		tripleConstraint.annotations !== undefined &&
		tripleConstraint.annotations[0].predicate === rex.sort
	) {
		return lexicographic[tripleConstraint.annotations[0].object]
	} else {
		return lexicographic[defaultSort]
	}
}
