import * as N3 from "n3";
import { toId, rdfType } from "./utils.js";
const { Store, DataFactory } = N3;
const RDFType = DataFactory.namedNode(rdfType);
export function cospan(types, datasets) {
    const coproduct = new Store();
    for (const [i, dataset] of datasets.entries()) {
        for (const quad of dataset) {
            if (quad.subject.termType === "BlankNode") {
                const value = `d${i}-${quad.subject.value}`;
                quad.subject = DataFactory.blankNode(value);
            }
            if (quad.object.termType === "BlankNode") {
                const value = `d${i}-${quad.object.value}`;
                quad.object = DataFactory.blankNode(value);
            }
            if (quad.graph.termType === "BlankNode") {
                const value = `d${i}-${quad.graph.value}`;
                quad.graph = DataFactory.blankNode(value);
            }
            else if (quad.graph.termType === "DefaultGraph") {
                quad.graph = DataFactory.blankNode(`d${i}`);
            }
        }
        coproduct.addQuads(dataset);
    }
    const classes = new Map();
    const partitions = new Set();
    for (const { type, key } of types.values()) {
        const object = DataFactory.namedNode(type);
        const subjects = coproduct.getSubjects(RDFType, object, null);
        if (key !== undefined) {
            const pushouts = new Map();
            for (const subject of subjects) {
                if (subject.termType === "BlankNode") {
                    const subjectId = subject.value;
                    const predicate = DataFactory.namedNode(key);
                    for (const object of coproduct.getObjects(subject, predicate, null)) {
                        const id = toId(object);
                        const pushout = pushouts.get(id);
                        if (pushout) {
                            pushout.add(subjectId);
                        }
                        else {
                            pushouts.set(id, new Set([subjectId]));
                        }
                    }
                }
            }
            for (const subjects of pushouts.values()) {
                const merge = new Set();
                for (const subject of subjects) {
                    if (classes.has(subject)) {
                        merge.add(classes.get(subject));
                    }
                    else {
                        merge.add(subjects);
                        partitions.add(subjects);
                        classes.set(subject, subjects);
                    }
                }
                if (merge.size > 1) {
                    const union = new Set();
                    partitions.add(union);
                    for (const set of merge) {
                        partitions.delete(set);
                        for (const subject of set) {
                            union.add(subject);
                        }
                    }
                    for (const subject of union) {
                        classes.set(subject, union);
                    }
                }
            }
        }
        else {
            for (const { value, termType } of subjects) {
                if (termType === "BlankNode") {
                    const partition = new Set([value]);
                    partitions.add(partition);
                    classes.set(value, partition);
                }
            }
        }
    }
    const names = new Map();
    const components = new Map();
    const inverse = new Map();
    let n = 0;
    for (const partition of partitions) {
        const name = `p-${n++}`;
        names.set(partition, name);
        inverse.set(name, partition);
        for (const b of partition) {
            components.set(b, name);
        }
    }
    const pushout = new Store();
    for (const dataset of datasets) {
        for (const quad of dataset) {
            if (quad.subject.termType === "BlankNode") {
                if (components.has(quad.subject.value)) {
                    const v = components.get(quad.subject.value);
                    quad.subject = DataFactory.blankNode(v);
                }
            }
            if (quad.object.termType === "BlankNode") {
                if (components.has(quad.object.value)) {
                    quad.object = DataFactory.blankNode(components.get(quad.object.value));
                }
            }
            if (quad.graph.termType === "BlankNode") {
                if (components.has(quad.graph.value)) {
                    quad.graph = DataFactory.blankNode(components.get(quad.graph.value));
                }
            }
        }
        pushout.addQuads(dataset);
    }
    return { coproduct, components, inverse, pushout };
}
//# sourceMappingURL=cospan.js.map