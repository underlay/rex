import { DataFactory } from "n3";
import { getExpressions, isSortAnnotation, } from "./schema.js";
import { toId } from "./utils.js";
import nodeSatisfies from "./satisfies.js";
import { getTypeOrder, getOrder } from "./order.js";
import { rdfTypeNode } from "./vocab.js";
function matchLiteralType(node, tripleConstraint) {
    return (node.termType === "Literal" &&
        tripleConstraint.valueExpr.datatype === node.datatype.value);
}
function* matchSortedTripleConstraint(subject, tripleConstraint, state) {
    const predicate = DataFactory.namedNode(tripleConstraint.predicate);
    const objects = state.pushout.getObjects(subject, predicate, null);
    for (const object of objects) {
        if (matchLiteralType(object, tripleConstraint)) {
            if (nodeSatisfies(object, tripleConstraint.valueExpr)) {
                yield object;
            }
        }
    }
}
function* matchTripleConstraint(subject, tripleConstraint, state) {
    const predicate = DataFactory.namedNode(tripleConstraint.predicate);
    const objects = state.pushout.getObjects(subject, predicate, null);
    for (const object of objects) {
        if (tripleConstraint.valueExpr === undefined) {
            yield object;
        }
        else {
            state.path.push([tripleConstraint.predicate, toId(object)]);
            yield* matchValueExpr(object, tripleConstraint.valueExpr, state);
            state.path.pop();
        }
    }
}
function* matchValueExpr(object, valueExpr, state) {
    if (typeof valueExpr === "string") {
        if (object.termType === "BlankNode") {
            const { type } = state.types.get(valueExpr);
            const typeNode = DataFactory.namedNode(type);
            const n = state.pushout.countQuads(object, rdfTypeNode, typeNode, null);
            if (n > 0) {
                const key = `${valueExpr}\t${toId(object)}`;
                const references = state.references.get(key);
                if (references === undefined) {
                    state.references.set(key, [[...state.path]]);
                }
                else {
                    references.push([...state.path]);
                }
                yield object;
            }
        }
    }
    else if (valueExpr.type === "NodeConstraint") {
        if (nodeSatisfies(object, valueExpr)) {
            yield object;
        }
    }
    else if (valueExpr.type === "ShapeOr") {
        for (const shapeExpr of valueExpr.shapeExprs) {
            yield* matchValueExpr(object, shapeExpr, state);
        }
    }
    else if (object.termType === "Literal") {
        // Do nothing, since the valueExpr is a shape
        // and so only quad subjects (IRIs or blank nodes)
        // can validate it
    }
    else {
        yield* matchShape(object, valueExpr, state);
    }
}
export function* matchShape(subject, shapeExpr, state) {
    const [nodeConstraint, shape] = getShape(shapeExpr);
    if (nodeConstraint !== null) {
        if (!nodeSatisfies(subject, nodeConstraint)) {
            return;
        }
    }
    const tripleConstraints = getExpressions(shape);
    const properties = new Map();
    for (const tripleConstraint of tripleConstraints) {
        const { predicate, min, max } = tripleConstraint;
        if (isSortAnnotation(tripleConstraint)) {
            const values = matchSortedTripleConstraint(subject, tripleConstraint, state);
            const order = getTypeOrder(tripleConstraint);
            const property = {
                order: order,
                values: Array.from(values),
                min: min === undefined ? 1 : min,
                max: max === undefined ? 1 : max === -1 ? Infinity : max,
            };
            properties.set(predicate, property);
        }
        else {
            const values = matchTripleConstraint(subject, tripleConstraint, state);
            properties.set(predicate, {
                order: getOrder(tripleConstraint),
                values: Array.from(values),
                min: min === undefined ? 1 : min,
                max: max === undefined ? 1 : max === -1 ? Infinity : max,
            });
        }
    }
    yield Object.freeze({ termType: "Tree", subject, properties });
}
function getShape(shape) {
    if (shape.type === "ShapeAnd") {
        return shape.shapeExprs;
    }
    else {
        return [null, shape];
    }
}
//# sourceMappingURL=match.js.map