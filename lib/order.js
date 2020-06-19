import { rex, defaultSort } from "./vocab.js";
import { xsdFloat, xsdDecimal, xsdDouble, encodeFloat, encodeDecimal, encodeDouble, encodeInteger, } from "./satisfies.js";
import { isNumeric, isTemporal, isBoolean, } from "./schema.js";
import { getNodeTerm } from "./state.js";
const numericInteger = {
    [rex.greater]: ((a, b) => encodeInteger(a) < encodeInteger(b)),
    [rex.lesser]: ((a, b) => encodeInteger(a) > encodeInteger(b)),
};
const numericDecimal = {
    [rex.greater]: ((a, b) => encodeDecimal(a) < encodeDecimal(b)),
    [rex.lesser]: ((a, b) => encodeDecimal(a) > encodeDecimal(b)),
};
const numericDouble = {
    [rex.greater]: ((a, b) => encodeDouble(a) < encodeDouble(b)),
    [rex.lesser]: ((a, b) => encodeDouble(a) > encodeDouble(b)),
};
const numericFloat = {
    [rex.greater]: ((a, b) => encodeFloat(a) < encodeFloat(b)),
    [rex.lesser]: ((a, b) => encodeFloat(a) > encodeFloat(b)),
};
function getNumericOrder(sort, datatype) {
    if (datatype === xsdDecimal) {
        return numericDecimal[sort];
    }
    else if (datatype === xsdDouble) {
        return numericDouble[sort];
    }
    else if (datatype === xsdFloat) {
        return numericFloat[sort];
    }
    else {
        return numericInteger[sort];
    }
}
const temporal = {
    [rex.earlier]: ((a, b) => new Date(a.value) < new Date(b.value)),
    [rex.later]: ((a, b) => new Date(a.value) > new Date(b.value)),
};
const boolean = {
    [rex.and]: ((a, b) => a.value === "true" && b.value === "true"),
    [rex.or]: ((a, b) => a.value === "true" || b.value === "true"),
};
const lexicographic = {
    [rex.ascending]: (a, b) => getNodeTerm(a).value < getNodeTerm(b).value,
    [rex.descending]: (a, b) => getNodeTerm(a).value > getNodeTerm(b).value,
};
export function getOrder(tripleConstraint) {
    const sort = tripleConstraint.annotations === undefined
        ? defaultSort
        : tripleConstraint.annotations[0].object;
    return lexicographic[sort];
}
export function getTypeOrder(tripleConstraint) {
    if (isNumeric(tripleConstraint)) {
        const { valueExpr: { datatype }, annotations: [{ object: sort }], } = tripleConstraint;
        if (datatype === xsdDecimal) {
            return numericDecimal[sort];
        }
        else if (datatype === xsdDouble) {
            return numericDouble[sort];
        }
        else if (datatype === xsdFloat) {
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
    else {
        return lexicographic[defaultSort];
    }
}
//# sourceMappingURL=order.js.map