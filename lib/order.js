import { rex, xsd, defaultSort } from "./vocab.js";
import { encodeFloat, encodeDecimal, encodeDouble, encodeInteger, } from "./satisfies.js";
import { isNumeric, isTemporal, isBoolean, } from "./schema.js";
const numericInteger = {
    [rex.greatest]: (a, b) => encodeInteger(a) > encodeInteger(b),
    [rex.least]: (a, b) => encodeInteger(a) < encodeInteger(b),
};
const numericDecimal = {
    [rex.greatest]: (a, b) => encodeDecimal(a) > encodeDecimal(b),
    [rex.least]: (a, b) => encodeDecimal(a) < encodeDecimal(b),
};
const numericDouble = {
    [rex.greatest]: (a, b) => encodeDouble(a) > encodeDouble(b),
    [rex.least]: (a, b) => encodeDouble(a) < encodeDouble(b),
};
const numericFloat = {
    [rex.greatest]: (a, b) => encodeFloat(a) > encodeFloat(b),
    [rex.least]: (a, b) => encodeFloat(a) < encodeFloat(b),
};
function getNumericOrder(sort, datatype) {
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
const temporal = {
    [rex.earliest]: (a, b) => new Date(a.value) < new Date(b.value),
    [rex.latest]: (a, b) => new Date(a.value) > new Date(b.value),
};
const boolean = {
    [rex.all]: (a, b) => a.value === "true" && b.value === "true",
    [rex.any]: (a, b) => a.value === "true" || b.value === "true",
};
const lexicographic = {
    [rex.first]: ({ value: a }, { value: b }) => a < b,
    [rex.last]: ({ value: a }, { value: b }) => b < a,
};
window.lex = lexicographic;
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