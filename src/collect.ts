import { Node, Property } from "./state.js"

export function collect<T extends Node, P extends Property<T>>({
	values,
	order,
	max,
}: P): P["values"] {
	const array: P["values"] = []
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
