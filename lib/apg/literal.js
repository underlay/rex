import { isDatatypeConstraint } from "./utils.js";
export function isLiteralResult(result) {
    return result.type === "NodeTest" && isDatatypeConstraint(result.shapeExpr);
}
export function makeLiteralShape({ type, datatype, ...rest }) {
    return { type: "NodeConstraint", datatype, ...rest };
}
//# sourceMappingURL=literal.js.map