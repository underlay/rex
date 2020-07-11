import RDF from "rdf-js"
import { Instance } from "./state"
import { fromId } from "./utils"

export function collect({ values, order, max }: Instance): RDF.Quad_Object[] {
	const array: RDF.Quad_Object[] = []
	for (const id of values.keys()) {
		const a = fromId(id) as RDF.Quad_Object
		const i = array.findIndex((b) => order(a, b))
		if (i === -1) {
			if (array.length !== max) {
				array.push(a)
			}
		} else {
			array.splice(i, 0, a)
			if (array.length > max) {
				array.pop()
			}
		}
	}
	return array
}
