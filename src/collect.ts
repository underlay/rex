import { D, Object } from "n3.ts"

import { Instance } from "./state.js"
import { fromId } from "./utils.js"

export function collect({ values, order, max }: Instance): Object<D>[] {
	const array: Object<D>[] = []
	for (const id of values.keys()) {
		const a = fromId(id) as Object<D>
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
	return array
}
