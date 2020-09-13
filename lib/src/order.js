import Ord from "fp-ts/lib/Ord.js";
import { rex, xsd, defaultSort } from "./vocab.js";
import { encodeFloat, encodeDecimal, encodeDouble, encodeInteger, } from "./satisfies.js";
import { isNumeric, isTemporal, isBoolean, } from "./schema.js";
// const s = sequenceT(encodeInteger)
const numericInteger = {
    [rex.greatest]: Ord.fromCompare((a, b) => {
        const A = encodeInteger(a);
        const B = encodeInteger(b);
        return A < B ? -1 : A > B ? 1 : 0;
    }),
    [rex.least]: Ord.fromCompare((a, b) => {
        const A = encodeInteger(a);
        const B = encodeInteger(b);
        return A < B ? 1 : A > B ? -1 : 0;
    }),
};
const numericDecimal = {
    [rex.greatest]: Ord.fromCompare((a, b) => {
        const A = encodeDecimal(a);
        const B = encodeDecimal(b);
        return A < B ? -1 : A > B ? 1 : 0;
    }),
    [rex.least]: Ord.fromCompare((a, b) => {
        const A = encodeDecimal(a);
        const B = encodeDecimal(b);
        return A < B ? 1 : A > B ? -1 : 0;
    }),
};
const numericDouble = {
    [rex.greatest]: Ord.fromCompare((a, b) => {
        const A = encodeDouble(a);
        const B = encodeDouble(b);
        return A < B ? -1 : A > B ? 1 : 0;
    }),
    [rex.least]: Ord.fromCompare((a, b) => {
        const A = encodeDouble(a);
        const B = encodeDouble(b);
        return A < B ? 1 : A > B ? -1 : 0;
    }),
};
const numericFloat = {
    [rex.greatest]: Ord.fromCompare((a, b) => {
        const A = encodeFloat(a);
        const B = encodeFloat(b);
        return A < B ? -1 : A > B ? 1 : 0;
    }),
    [rex.least]: Ord.fromCompare((a, b) => {
        const A = encodeFloat(a);
        const B = encodeFloat(b);
        return A < B ? 1 : A > B ? -1 : 0;
    }),
};
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
    [rex.latest]: Ord.fromCompare((a, b) => {
        const A = new Date(a.value);
        const B = new Date(b.value);
        return A < B ? -1 : A > B ? 1 : 0;
    }),
    [rex.earliest]: Ord.fromCompare((a, b) => {
        const A = new Date(a.value);
        const B = new Date(b.value);
        return A < B ? 1 : A > B ? -1 : 0;
    }),
};
const boolean = {
    [rex.all]: Ord.fromCompare((a, b) => {
        return a.value === b.value ? 0 : a.value === "true" ? -1 : 1;
    }),
    [rex.any]: Ord.fromCompare((a, b) => {
        return a.value === b.value ? 0 : a.value === "true" ? 1 : -1;
    }),
};
const lexicographic = {
    [rex.first]: Ord.fromCompare(({ value: a }, { value: b }) => a < b ? -1 : a > b ? 1 : 0),
    [rex.last]: Ord.fromCompare(({ value: a }, { value: b }) => a < b ? 1 : a > b ? -1 : 0),
};
export function getLexicographicOrder(tripleConstraint) {
    const sort = tripleConstraint.annotations === undefined
        ? defaultSort
        : tripleConstraint.annotations[0].object;
    return lexicographic[sort];
}
export function getOrder(sort, datatype) {
    if (sort === rex.first || sort === rex.last) {
        return lexicographic[sort];
    }
    else if (sort === rex.earliest || sort === rex.latest) {
        return temporal[sort];
    }
    else if (sort === rex.all || sort === rex.any) {
        return boolean[sort];
    }
    else if (datatype === xsd.decimal) {
        return numericDecimal[sort];
    }
    else if (datatype === xsd.double) {
        return numericDouble[sort];
    }
    else if (datatype === xsd.float) {
        return numericFloat[sort];
    }
    else {
        return numericInteger[sort];
    }
}
export function getTypeOrder(tripleConstraint) {
    if (isNumeric(tripleConstraint)) {
        const { valueExpr: { datatype }, annotations: [{ object: sort }], } = tripleConstraint;
        if (datatype === xsd.decimal) {
            return numericDecimal[sort];
        }
        else if (datatype === xsd.double) {
            return numericDouble[sort];
        }
        else if (datatype === xsd.float) {
            return numericFloat[sort];
        }
        else {
            return numericInteger[sort];
        }
    }
    else if (isTemporal(tripleConstraint)) {
        const { annotations: [{ object: sort }], } = tripleConstraint;
        return temporal[sort];
    }
    else if (isBoolean(tripleConstraint)) {
        const { annotations: [{ object: sort }], } = tripleConstraint;
        return boolean[sort];
    }
    else if (tripleConstraint.annotations !== undefined &&
        tripleConstraint.annotations[0].predicate === rex.sort) {
        return lexicographic[tripleConstraint.annotations[0].object];
    }
    else {
        return lexicographic[defaultSort];
    }
}
//# sourceMappingURL=order.js.map