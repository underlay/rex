import { DataFactory } from "n3";
import { getShape, getExpressions, isDatatypeAnnotation, isWithAnnotation, isMetaAnnotation, } from "./schema.js";
import { getNodeTerm } from "./state.js";
import { toId } from "./utils.js";
import nodeSatisfies from "./satisfies.js";
import { getTypeOrder, getLexicographicOrder } from "./order.js";
import { rdfTypeNode, rex } from "./vocab.js";
export function* matchTripleConstraint(subject, { predicate, valueExpr }, state) {
    const p = DataFactory.namedNode(predicate);
    const objects = state.pushout.getObjects(subject, p, null);
    for (const object of objects) {
        const node = matchValueExpr(predicate, object, valueExpr, state);
        if (node !== null) {
            yield node;
        }
    }
}
function matchValueExpr(predicate, object, valueExpr, state) {
    if (valueExpr === undefined) {
        return object;
    }
    else if (typeof valueExpr === "string") {
        if (object.termType === "BlankNode") {
            const { type } = state.types.get(valueExpr);
            const typeNode = DataFactory.namedNode(type);
            const n = state.pushout.countQuads(object, rdfTypeNode, typeNode, null);
            if (n > 0) {
                const path = state.path.concat([[predicate, toId(object)]]);
                const key = `${valueExpr}\t${object.value}`;
                const references = state.references.get(key);
                if (references === undefined) {
                    state.references.set(key, [path]);
                }
                else {
                    references.push(path);
                }
                return object;
            }
        }
    }
    else if (valueExpr.type === "NodeConstraint") {
        if (nodeSatisfies(object, valueExpr)) {
            return object;
        }
    }
    else if (valueExpr.type === "Shape" || valueExpr.type === "ShapeAnd") {
        if (object.termType !== "Literal") {
            state.path.push([predicate, toId(object)]);
            const tree = matchShape(object, valueExpr, state);
            state.path.pop();
            return tree;
        }
    }
    return null;
}
export function matchShape(subject, shapeExpr, state) {
    const [nodeConstraint, shape] = getShape(shapeExpr);
    if (nodeConstraint !== null) {
        if (!nodeSatisfies(subject, nodeConstraint)) {
            return null;
        }
    }
    const tree = { termType: "Tree", subject, properties: new Map() };
    const references = [];
    for (const tripleConstraint of getExpressions(shape)) {
        const { predicate, valueExpr, min, max } = tripleConstraint;
        if (isDatatypeAnnotation(tripleConstraint)) {
            tree.properties.set(predicate, {
                ...getRange(min, max),
                order: getTypeOrder(tripleConstraint),
                values: Array.from(matchTypedTripleConstraint(subject, tripleConstraint, state)),
            });
        }
        else if (isWithAnnotation(tripleConstraint)) {
            references.push(tripleConstraint);
        }
        else if (isMetaAnnotation(tripleConstraint)) {
            const [{ object: metaReference }, sort] = tripleConstraint.annotations;
            if (sort === undefined) {
                let order = (a, b) => getNodeTerm(a).value < getNodeTerm(b).value;
                const graphs = new Map();
                const property = {
                    ...getRange(min, max),
                    order: order,
                    values: [],
                    reference: metaReference,
                    graphs: graphs,
                };
                const nullMatches = new Set();
                const p = DataFactory.namedNode(predicate);
                for (const coSubject of preImage(subject, state)) {
                    const quads = state.coproduct.getQuads(coSubject, p, null, null);
                    for (const { object, graph } of quads) {
                        const id = toId(object);
                        if (nullMatches.has(id)) {
                            continue;
                        }
                        else if (graphs.has(id)) {
                            graphs.get(id).add(toId(graph));
                        }
                        else {
                            const node = matchValueExpr(predicate, object, valueExpr, state);
                            if (node === null) {
                                nullMatches.add(id);
                            }
                            else {
                                property.values.push(node);
                                graphs.set(id, new Set([toId(graph)]));
                            }
                        }
                    }
                }
                for (const [id, meta] of graphs) {
                    const path = state.path.concat([[predicate, id]]);
                    for (const graph of meta) {
                        const key = `${metaReference}\t${graph}`;
                        const references = state.metaReferences.get(key);
                        if (references === undefined) {
                            state.metaReferences.set(key, [path]);
                        }
                        else {
                            references.push(path);
                        }
                    }
                }
                tree.properties.set(predicate, property);
            }
            else if (sort.predicate === rex.with) {
                // sort.object
                let order = (a, b) => getNodeTerm(a).value < getNodeTerm(b).value;
                const graphs = new Map();
                const property = {
                    ...getRange(min, max),
                    order: order,
                    values: [],
                    reference: metaReference,
                    withReference: sort.object,
                    graphs: graphs,
                };
                const nullMatches = new Set();
                const p = DataFactory.namedNode(predicate);
                for (const coSubject of preImage(subject, state)) {
                    const quads = state.coproduct.getQuads(coSubject, p, null, null);
                    for (const { object, graph } of quads) {
                        const id = toId(object);
                        if (nullMatches.has(id)) {
                            continue;
                        }
                        else if (graphs.has(id)) {
                            graphs.get(id).add(toId(graph));
                        }
                        else {
                            const node = matchValueExpr(predicate, object, valueExpr, state);
                            if (node === null) {
                                nullMatches.add(id);
                            }
                            else {
                                property.values.push(node);
                                graphs.set(id, new Set([toId(graph)]));
                            }
                        }
                    }
                }
                for (const [id, meta] of graphs) {
                    const path = state.path.concat([[predicate, id]]);
                    for (const graph of meta) {
                        const key = `${metaReference}\t${graph}`;
                        const references = state.metaReferences.get(key);
                        if (references === undefined) {
                            state.metaReferences.set(key, [path]);
                        }
                        else {
                            references.push(path);
                        }
                    }
                }
                tree.properties.set(predicate, property);
            }
        }
        else {
            tree.properties.set(predicate, {
                ...getRange(min, max),
                order: getLexicographicOrder(tripleConstraint),
                values: Array.from(matchTripleConstraint(subject, tripleConstraint, state)),
            });
        }
    }
    for (const tripleConstraint of references) {
        const { predicate, valueExpr, min, max, annotations: [{ object: referencePredicate }], } = tripleConstraint;
        const reference = tree.properties.get(referencePredicate);
        if (reference === undefined) {
            throw new Error(`Reference property not found: ${referencePredicate}`);
        }
        const p = DataFactory.namedNode(predicate);
        const ref = DataFactory.namedNode(referencePredicate);
        const links = new Map();
        const nullMatches = new Set();
        const values = [];
        for (const value of reference.values) {
            for (const coReference of preImage(getNodeTerm(value), state)) {
                const coSubjects = state.coproduct.getSubjects(ref, coReference, null);
                for (const coSubject of coSubjects) {
                    if (state.components.get(coSubject.value) === subject.value) {
                        const coObjects = state.coproduct.getObjects(coSubject, p, null);
                        for (const coObject of coObjects) {
                            const object = image(coObject, state);
                            const id = toId(object);
                            if (nullMatches.has(id)) {
                                continue;
                            }
                            else if (links.has(id)) {
                                if (reference.order(value, links.get(id))) {
                                    links.set(id, value);
                                }
                            }
                            else {
                                const node = matchValueExpr(predicate, object, valueExpr, state);
                                if (node === null) {
                                    nullMatches.add(id);
                                }
                                else {
                                    links.set(id, value);
                                    values.push(node);
                                }
                            }
                        }
                    }
                }
            }
        }
        tree.properties.set(predicate, {
            ...getRange(min, max),
            order: (a, b) => reference.order(links.get(toId(getNodeTerm(a))), links.get(toId(getNodeTerm(b)))),
            values: values,
        });
    }
    return Object.freeze(tree);
}
export function image(term, state) {
    if (term.termType === "BlankNode") {
        return DataFactory.blankNode(state.components.get(term.value));
    }
    return term;
}
export function* preImage(term, state) {
    if (term.termType === "BlankNode") {
        for (const value of state.inverse.get(term.value)) {
            yield DataFactory.blankNode(value);
        }
    }
    else {
        yield term;
    }
}
export const getRange = (min, max) => ({
    min: min === undefined ? 1 : min,
    max: max === undefined ? 1 : max === -1 ? Infinity : max,
});
function matchLiteralType(node, tripleConstraint) {
    return (node.termType === "Literal" &&
        tripleConstraint.valueExpr.datatype === node.datatype.value);
}
function* matchTypedTripleConstraint(subject, tripleConstraint, state) {
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
//# sourceMappingURL=match.js.map