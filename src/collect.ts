import { Node, Property } from "./state.js"

export function collect({ values, order, max }: Property): Node[] {
	const array: Node[] = []
	for (const a of values) {
		const i = array.findIndex((b) => order(a, b))
		if (i === -1) {
			array.push(a)
		} else {
			array.splice(i, 0, a)
		}
		if (array.length > max) {
			array.shift()
		}
	}
	return array
}
