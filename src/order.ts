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
	baseTripleConstraint,
	sortLexicographic,
	sortNumeric,
	sortBoolean,
	sortTemporal,
	isNumeric,
	isTemporal,
	isBoolean,
	numeric,
	numericDatatype,
} from "./schema.js"
import { Node, getNodeTerm } from "./state.js"
import { TypeOf } from "io-ts/es6/index.js"

export type Order = (a: Node, b: Node) => boolean

const numericInteger = {
	[rex.greatest]: (
		a: TypedLiteral<integerDatatype>,
		b: TypedLiteral<integerDatatype>
	) => encodeInteger(a) < encodeInteger(b),
	[rex.least]: (
		a: TypedLiteral<integerDatatype>,
		b: TypedLiteral<integerDatatype>
	) => encodeInteger(a) > encodeInteger(b),
}

const numericDecimal = {
	[rex.greatest]: (
		a: TypedLiteral<typeof xsd.decimal>,
		b: TypedLiteral<typeof xsd.decimal>
	) => encodeDecimal(a) < encodeDecimal(b),
	[rex.least]: (
		a: TypedLiteral<typeof xsd.decimal>,
		b: TypedLiteral<typeof xsd.decimal>
	) => encodeDecimal(a) > encodeDecimal(b),
}

const numericDouble = {
	[rex.greatest]: (
		a: TypedLiteral<typeof xsd.double>,
		b: TypedLiteral<typeof xsd.double>
	) => encodeDouble(a) < encodeDouble(b),
	[rex.least]: (
		a: TypedLiteral<typeof xsd.double>,
		b: TypedLiteral<typeof xsd.double>
	) => encodeDouble(a) > encodeDouble(b),
}

const numericFloat = {
	[rex.greatest]: (
		a: TypedLiteral<typeof xsd.float>,
		b: TypedLiteral<typeof xsd.float>
	) => encodeFloat(a) < encodeFloat(b),
	[rex.least]: (
		a: TypedLiteral<typeof xsd.float>,
		b: TypedLiteral<typeof xsd.float>
	) => encodeFloat(a) > encodeFloat(b),
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
	[rex.first]: (a: Node, b: Node) =>
		getNodeTerm(a).value < getNodeTerm(b).value,
	[rex.last]: (a: Node, b: Node) => getNodeTerm(a).value > getNodeTerm(b).value,
}

export function getLexicographicOrder(
	tripleConstraint: baseTripleConstraint & sortLexicographic
): Order {
	const sort =
		tripleConstraint.annotations === undefined
			? defaultSort
			: tripleConstraint.annotations[0].object

	return lexicographic[sort]
}

export function getTypeOrder<
	S extends sortNumeric | sortTemporal | sortBoolean
>(tripleConstraint: baseTripleConstraint & S): Order {
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
	} else {
		return lexicographic[defaultSort]
	}
}
