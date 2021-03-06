import { NamedNode } from "n3.ts";
import { isReferenceAnnotation, } from "./schema.js";
import { getRange, toId } from "./utils.js";
import nodeSatisfies from "./satisfies.js";
export function getTable({ expressions }, state) {
    const table = new Map();
    for (const subject of state.pushout.subjects(null, null, null)) {
        if (subject.termType !== "BlankNode") {
            continue;
        }
        const row = getRow(subject, expressions, state);
        if (row !== null) {
            table.set(subject.value, row);
        }
    }
    return table;
}
function getRow(subject, expressions, state) {
    const row = [];
    for (const expression of expressions) {
        const range = getRange(expression.min, expression.max);
        const values = new Set();
        const predicate = new NamedNode(expression.predicate);
        for (const object of state.pushout.objects(subject, predicate, null)) {
            if (typeof expression.valueExpr === "string" ||
                nodeSatisfies(object, expression.valueExpr)) {
                values.add(toId(object));
            }
        }
        if (values.size < range.min) {
            return null;
        }
        else {
            row.push(values);
        }
    }
    return row;
}
function filterTables(tables, state) {
    for (const [shapeId, { expressions }] of state.shapes) {
        for (const expression of expressions) {
            if (isReferenceAnnotation(expression)) {
                const [{ predicate, object: reference }, { object: sort },] = expression.annotations;
            }
        }
    }
}
// function appendLinks<T>(node: T, sort: T[], map: Map<T, Set<T>>) {
// 	if (sort.indexOf(node) !== -1) {
// 		sort.push(node)
// 		for (const link of map.get(node)!) {
// 			appendLinks(link, sort, map)
// 		}
// 	}
// }
// function getSort<T>(map: Map<T, Set<T>>): T[] {
// 	const sort: T[] = []
// 	for (const node of map.keys()) {
// 		appendLinks(node, sort, map)
// 	}
// 	return sort
// }
// function fooooooo(schema: t.TypeOf<typeof Schema>, coproduct: Store) {}
//# sourceMappingURL=table.js.map