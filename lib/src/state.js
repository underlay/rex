import { getExpressions } from "./schema.js";
import { getPushout } from "./pushout.js";
export function getShapeMap(schema) {
    return new Map(schema.shapes.map((shapeExpr) => {
        const { id, shapeExprs: [_, shape], } = shapeExpr;
        const value = {
            expressions: getExpressions(shape),
        };
        if (shape.annotations !== undefined) {
            value.key = shape.annotations[0].object;
        }
        return [id, Object.freeze(value)];
    }));
}
export function getState(schema, coproduct) {
    const shapes = getShapeMap(schema);
    const state = Object.assign({
        coproduct,
        shapes,
        instances: new Map(),
        path: [],
        references: new Map(),
        metaReferences: new Map(),
    }, getPushout(shapes, coproduct));
    return Object.freeze(state);
}
//# sourceMappingURL=state.js.map