import { Store, NamedNode, BlankNode } from "n3.ts";
import { toId } from "./utils.js";
const wrap = (term, i) => term.termType === "BlankNode"
    ? new BlankNode(`d${i}-${term.value}`)
    : term.termType === "DefaultGraph"
        ? new BlankNode(`d${i}`)
        : term;
export function getCoproduct(datasets) {
    const coproduct = new Store();
    for (const [i, store] of datasets.entries()) {
        for (const q of store) {
            coproduct.addQuad(wrap(q.subject, i), q.predicate, wrap(q.object, i), wrap(q.graph, i));
        }
    }
    return coproduct;
}
export function getPushout(shapes, coproduct) {
    const classes = new Map();
    const partitions = new Set();
    for (const { key } of shapes.values()) {
        if (key !== undefined) {
            const pushouts = new Map();
            for (const subject of coproduct.subjects(null, null, null)) {
                if (subject.termType === "BlankNode") {
                    const predicate = new NamedNode(key);
                    for (const object of coproduct.objects(subject, predicate, null)) {
                        const id = toId(object);
                        const pushout = pushouts.get(id);
                        if (pushout) {
                            pushout.add(subject.value);
                        }
                        else {
                            pushouts.set(id, new Set([subject.value]));
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
            for (const { value, termType } of coproduct.subjects(null, null, null)) {
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
        const name = `p${n++}`;
        names.set(partition, name);
        inverse.set(name, partition);
        for (const b of partition) {
            components.set(b, name);
        }
    }
    const pushout = new Store();
    for (const quad of coproduct.getQuads(null, null, null, null)) {
        let { subject, predicate, object, graph } = quad;
        if (subject.termType === "BlankNode") {
            const value = components.get(subject.value);
            if (value !== undefined) {
                subject = new BlankNode(value);
            }
        }
        if (object.termType === "BlankNode") {
            const value = components.get(object.value);
            if (value !== undefined) {
                object = new BlankNode(value);
            }
        }
        if (graph.termType === "BlankNode") {
            const value = components.get(graph.value);
            if (value !== undefined) {
                graph = new BlankNode(value);
            }
        }
        pushout.addQuad(subject, predicate, object, graph);
    }
    return { components, inverse, pushout };
}
//# sourceMappingURL=pushout.js.map