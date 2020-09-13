import Ord from "fp-ts/lib/Ord.js"
// import { sequenceT } from "fp-ts/Apply"

import { Term, D } from "n3.ts"
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
	numericDatatype,
	AnnotatedTripleConstraint,
	temporalDatatype,
	booleanDatatype,
} from "./schema.js"

export type Order = Ord.Ord<Term<D>>

// const s = sequenceT(encodeInteger)

const numericInteger = {
	[rex.greatest]: Ord.fromCompare<TypedLiteral<integerDatatype>>((a, b) => {
		const A = encodeInteger(a)
		const B = encodeInteger(b)
		return A < B ? -1 : A > B ? 1 : 0
	}),
	[rex.least]: Ord.fromCompare<TypedLiteral<integerDatatype>>((a, b) => {
		const A = encodeInteger(a)
		const B = encodeInteger(b)
		return A < B ? 1 : A > B ? -1 : 0
	}),
}

const numericDecimal = {
	[rex.greatest]: Ord.fromCompare<TypedLiteral<typeof xsd.decimal>>((a, b) => {
		const A = encodeDecimal(a)
		const B = encodeDecimal(b)
		return A < B ? -1 : A > B ? 1 : 0
	}),
	[rex.least]: Ord.fromCompare<TypedLiteral<typeof xsd.decimal>>((a, b) => {
		const A = encodeDecimal(a)
		const B = encodeDecimal(b)
		return A < B ? 1 : A > B ? -1 : 0
	}),
}

const numericDouble = {
	[rex.greatest]: Ord.fromCompare<TypedLiteral<typeof xsd.double>>((a, b) => {
		const A = encodeDouble(a)
		const B = encodeDouble(b)
		return A < B ? -1 : A > B ? 1 : 0
	}),
	[rex.least]: Ord.fromCompare<TypedLiteral<typeof xsd.double>>((a, b) => {
		const A = encodeDouble(a)
		const B = encodeDouble(b)
		return A < B ? 1 : A > B ? -1 : 0
	}),
}

const numericFloat = {
	[rex.greatest]: Ord.fromCompare<TypedLiteral<typeof xsd.float>>((a, b) => {
		const A = encodeFloat(a)
		const B = encodeFloat(b)
		return A < B ? -1 : A > B ? 1 : 0
	}),
	[rex.least]: Ord.fromCompare<TypedLiteral<typeof xsd.float>>((a, b) => {
		const A = encodeFloat(a)
		const B = encodeFloat(b)
		return A < B ? 1 : A > B ? -1 : 0
	}),
}

// function getNumericOrder<T extends numericDatatype>(
// 	sort: t.TypeOf<typeof numeric>,
// 	datatype: T
// ): Order {
// 	if (datatype === xsd.decimal) {
// 		return numericDecimal[sort] as Order
// 	} else if (datatype === xsd.double) {
// 		return numericDouble[sort] as Order
// 	} else if (datatype === xsd.float) {
// 		return numericFloat[sort] as Order
// 	} else {
// 		return numericInteger[sort] as Order
// 	}
// }

const temporal = {
	[rex.latest]: Ord.fromCompare<
		TypedLiteral<typeof xsd.date | typeof xsd.dateTime>
	>((a, b) => {
		const A = new Date(a.value)
		const B = new Date(b.value)
		return A < B ? -1 : A > B ? 1 : 0
	}),
	[rex.earliest]: Ord.fromCompare<
		TypedLiteral<typeof xsd.date | typeof xsd.dateTime>
	>((a, b) => {
		const A = new Date(a.value)
		const B = new Date(b.value)
		return A < B ? 1 : A > B ? -1 : 0
	}),
}

const boolean = {
	[rex.all]: Ord.fromCompare<TypedLiteral<typeof xsd.boolean>>((a, b) => {
		return a.value === b.value ? 0 : a.value === "true" ? -1 : 1
	}),
	[rex.any]: Ord.fromCompare<TypedLiteral<typeof xsd.boolean>>((a, b) => {
		return a.value === b.value ? 0 : a.value === "true" ? 1 : -1
	}),
}

const lexicographic = {
	[rex.first]: Ord.fromCompare<Term<D>>(({ value: a }, { value: b }) =>
		a < b ? -1 : a > b ? 1 : 0
	),
	[rex.last]: Ord.fromCompare<Term<D>>(({ value: a }, { value: b }) =>
		a < b ? 1 : a > b ? -1 : 0
	),
}

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
