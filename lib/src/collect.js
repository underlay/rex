import { fromId } from "./utils.js";
export function collect({ values, order, max }) {
    const array = [];
    for (const id of values.keys()) {
        const a = fromId(id);
        // const i = array.findIndex((b) => order(a, b))
        // if (i === -1) {
        // 	if (array.length !== max) {
        // 		array.push(a)
        // 	}
        // } else {
        // 	array.splice(i, 0, a)
        // 	if (array.length > max) {
        // 		array.pop()
        // 	}
        // }
    }
    return array;
}
//# sourceMappingURL=collect.js.map