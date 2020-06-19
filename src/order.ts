import { rex, xsdDate, xsdBoolean, defaultSort, xsdDateTime } from "./vocab.js"
import {
	xsdFloat,
	xsdDecimal,
	xsdDouble,
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
	isSortAnnotation,
} from "./schema.js"
import { Node, getNodeTerm } from "./state.js"
import { TypeOf } from "io-ts/es6"

type Order<T extends Node> = (a: T, b: T) => boolean
type TypedOrder = Order<TypedLiteral<string>>

const numericInteger = {
	[rex.greater]: ((
		a: TypedLiteral<integerDatatype>,
		b: TypedLiteral<integerDatatype>
	) => encodeInteger(a) < encodeInteger(b)) as TypedOrder,
	[rex.lesser]: ((
		a: TypedLiteral<integerDatatype>,
		b: TypedLiteral<integerDatatype>
	) => encodeInteger(a) > encodeInteger(b)) as TypedOrder,
}

const numericDecimal = {
	[rex.greater]: ((
		a: TypedLiteral<typeof xsdDecimal>,
		b: TypedLiteral<typeof xsdDecimal>
	) => encodeDecimal(a) < encodeDecimal(b)) as TypedOrder,
	[rex.lesser]: ((
		a: TypedLiteral<typeof xsdDecimal>,
		b: TypedLiteral<typeof xsdDecimal>
	) => encodeDecimal(a) > encodeDecimal(b)) as TypedOrder,
}

const numericDouble = {
	[rex.greater]: ((
		a: TypedLiteral<typeof xsdDouble>,
		b: TypedLiteral<typeof xsdDouble>
	) => encodeDouble(a) < encodeDouble(b)) as TypedOrder,
	[rex.lesser]: ((
		a: TypedLiteral<typeof xsdDouble>,
		b: TypedLiteral<typeof xsdDouble>
	) => encodeDouble(a) > encodeDouble(b)) as TypedOrder,
}

const numericFloat = {
	[rex.greater]: ((
		a: TypedLiteral<typeof xsdFloat>,
		b: TypedLiteral<typeof xsdFloat>
	) => encodeFloat(a) < encodeFloat(b)) as TypedOrder,
	[rex.lesser]: ((
		a: TypedLiteral<typeof xsdFloat>,
		b: TypedLiteral<typeof xsdFloat>
	) => encodeFloat(a) > encodeFloat(b)) as TypedOrder,
}

function getNumericOrder<T extends numericDatatype>(
	sort: TypeOf<typeof numeric>,
	datatype: T
): Order<TypedLiteral<T>> {
	if (datatype === xsdDecimal) {
		return numericDecimal[sort]
	} else if (datatype === xsdDouble) {
		return numericDouble[sort]
	} else if (datatype === xsdFloat) {
		return numericFloat[sort]
	} else {
		return numericInteger[sort]
	}
}

const temporal = {
	[rex.earlier]: ((
		a: TypedLiteral<typeof xsdDate | typeof xsdDateTime>,
		b: TypedLiteral<typeof xsdDate | typeof xsdDateTime>
	) => new Date(a.value) < new Date(b.value)) as TypedOrder,
	[rex.later]: ((
		a: TypedLiteral<typeof xsdDate | typeof xsdDateTime>,
		b: TypedLiteral<typeof xsdDate | typeof xsdDateTime>
	) => new Date(a.value) > new Date(b.value)) as TypedOrder,
}

const boolean = {
	[rex.and]: ((
		a: TypedLiteral<typeof xsdBoolean>,
		b: TypedLiteral<typeof xsdBoolean>
	) => a.value === "true" && b.value === "true") as TypedOrder,
	[rex.or]: ((
		a: TypedLiteral<typeof xsdBoolean>,
		b: TypedLiteral<typeof xsdBoolean>
	) => a.value === "true" || b.value === "true") as TypedOrder,
}

const lexicographic = {
	[rex.ascending]: (a: Node, b: Node) =>
		getNodeTerm(a).value < getNodeTerm(b).value,
	[rex.descending]: (a: Node, b: Node) =>
		getNodeTerm(a).value > getNodeTerm(b).value,
}

export function getOrder(
	tripleConstraint: baseTripleConstraint & sortLexicographic
): Order<Node> {
	const sort =
		tripleConstraint.annotations === undefined
			? defaultSort
			: tripleConstraint.annotations[0].object

	return lexicographic[sort]
}

export function getTypeOrder<
	S extends sortNumeric | sortTemporal | sortBoolean
>(
	tripleConstraint: baseTripleConstraint & S
): Order<TypedLiteral<S["valueExpr"]["datatype"]>> {
	if (isNumeric(tripleConstraint)) {
		const {
			valueExpr: { datatype },
			annotations: [{ object: sort }],
		} = tripleConstraint
		if (datatype === xsdDecimal) {
			return numericDecimal[sort]
		} else if (datatype === xsdDouble) {
			return numericDouble[sort]
		} else if (datatype === xsdFloat) {
			return numericFloat[sort]
		} else {
			return numericInteger[sort]
		}
	} else if (isTemporal(tripleConstraint)) {
		const {
			annotations: [{ object: sort }],
		} = tripleConstraint
		return temporal[sort]
	} else if (isBoolean(tripleConstraint)) {
		const {
			annotations: [{ object: sort }],
		} = tripleConstraint
		return boolean[sort]
	} else {
		return lexicographic[defaultSort]
	}
}
