import { getExpressions, isEmptyProductShape } from "./schema.js";
export function getTypeMap(schema) {
    return new Map(schema.shapes.map((shapeExpr) => {
        const { id, shapeExprs: [_, shape], } = shapeExpr;
        const [{ valueExpr: { values: [type], }, },] = getExpressions(shape);
        const value = { type, shapeExpr };
        if (!isEmptyProductShape(shape) && shape.annotations !== undefined) {
            const [{ object }] = shape.annotations;
            value.key = object;
        }
        return [id, Object.freeze(value)];
    }));
}
//# sourceMappingURL=state.js.map