import { DataFactory } from "n3";
import { cospan } from "./cospan.js";
import { toId } from "./utils.js";
import { getTypeMap, getNodeTerm, } from "./state.js";
import { matchShape } from "./match.js";
import { collect } from "./collect.js";
import { rdfTypeNode } from "./vocab.js";
function minTrim(node) {
    if (node.termType === "Tree") {
        for (const [predicate, leaf] of node.properties) {
            leaf.values = leaf.values.filter(minTrim);
            if (leaf.values.length < leaf.min) {
                return false;
            }
        }
    }
    return true;
}
function handleDelete(shape, subject, state) {
    state.tables.get(shape).delete(subject);
    for (const references of state.references.values()) {
        for (const [i, [[refShape, refSubject]]] of references.entries()) {
            if (refShape === shape && refSubject === subject) {
                references.splice(i, 1);
            }
        }
    }
    const references = state.references.get(`${shape}\t${subject}`);
    if (references !== undefined) {
        for (const [[refShape, refSubject], ...values] of references) {
            const tree = state.tables.get(refShape).get(refSubject);
            const valid = percolate(tree, values);
            if (!valid) {
                handleDelete(refShape, refSubject, state);
            }
        }
    }
}
function percolate(tree, [[property, object], ...values]) {
    const leaf = tree.properties.get(property);
    if (values.length === 0) {
        const index = leaf.values.findIndex((node) => toId(getNodeTerm(node)) === object);
        if (index !== -1) {
            leaf.values.splice(index, 1);
        }
    }
    else {
        leaf.values = leaf.values.filter((value) => value.termType !== "Tree" || percolate(value, values));
    }
    return leaf.values.length >= leaf.min;
}
const isTypedProperty = (property) => false;
function populateDataset(tree, dataset) {
    for (const [key, property] of tree.properties) {
        const predicate = DataFactory.namedNode(key);
        const objects = isTypedProperty(property)
            ? collect(property)
            : collect(property);
        for (const object of objects) {
            if (object.termType === "Tree") {
                populateDataset(object, dataset);
            }
            else {
                dataset.push(DataFactory.quad(tree.subject, predicate, object));
            }
        }
    }
}
export function materialize(schema, datasets) {
    const types = getTypeMap(schema);
    const state = Object.freeze(Object.assign({
        types,
        tables: new Map(),
        path: [],
        values: [],
        references: new Map(),
    }, cospan(types, datasets)));
    for (const [shape, { type, shapeExpr }] of types) {
        const table = new Map();
        const subjects = state.pushout.getSubjects(rdfTypeNode, DataFactory.namedNode(type), null);
        for (const subject of subjects) {
            state.path.push([shape, toId(subject)]);
            for (const tree of matchShape(subject, shapeExpr, state)) {
                table.set(toId(tree.subject), tree);
            }
            state.path.pop();
        }
        state.tables.set(shape, table);
    }
    // First we trim minimums
    for (const [shape, table] of state.tables) {
        for (const [subject, tree] of table) {
            const valid = minTrim(tree);
            if (!valid) {
                handleDelete(shape, subject, state);
            }
        }
    }
    // Then we sort, take maximums, and populate
    const dataset = [];
    for (const table of state.tables.values()) {
        for (const tree of table.values()) {
            populateDataset(tree, dataset);
        }
    }
    return dataset;
}
//# sourceMappingURL=materialize.js.map