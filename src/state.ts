import t from "./io.js"
import { Store } from "n3.ts"

import { Schema, getExpressions, AnnotatedTripleConstraint } from "./schema.js"
import { Order } from "./order.js"
import { getPushout } from "./pushout.js"

export type Instance = {
	values: Map<string, Set<string>>
	order: Order
	min: number
	max: number
}

export type Entry = [string, string, number, string]
export type State = Readonly<{
	references: Map<string, Entry[]>
	metaReferences: Map<string, Entry[]>
	shapes: ShapeMap
	instances: Map<string, Map<string, Instance[]>>
	coproduct: Store
	components: Map<string, string>
	inverse: Map<string, Set<string>>
	pushout: Store
}>

export type Shape = {
	key?: string
	expressions: AnnotatedTripleConstraint[]
}

export type ShapeMap = Map<string, Readonly<Shape>>

export function getShapeMap(schema: t.TypeOf<typeof Schema>): ShapeMap {
	return new Map(
		schema.shapes.map((shapeExpr) => {
			const {
				id,
				shapeExprs: [_, shape],
			} = shapeExpr

			const value: Shape = {
				expressions: getExpressions(shape),
			}

			if (shape.annotations !== undefined) {
				value.key = shape.annotations[0].object
			}

			return [id, Object.freeze(value)]
		})
	)
}

export function getState(
	schema: t.TypeOf<typeof Schema>,
	coproduct: Store
): State {
	const shapes = getShapeMap(schema)
	const state: State = Object.assign(
		{
			coproduct,
			shapes,
			instances: new Map(),
			path: [],
			references: new Map(),
			metaReferences: new Map(),
		},
		getPushout(shapes, coproduct)
	)
	return Object.freeze(state)
}
