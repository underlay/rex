import { Store } from "n3"
import { TypeOf } from "io-ts/es6/index.js"
import { Schema, getExpressions, isEmptyProductShape } from "./schema.js"
import { Order } from "./order.js"

export type Instance = {
	values: Map<string, Set<string>>
	order: Order
	min: number
	max: number
}

export type Instances = Map<string, Instance[]>

export type Entry = [string, string, number, string]
export type State = Readonly<{
	references: Map<string, Entry[]>
	metaReferences: Map<string, Entry[]>
	types: TypeMap
	tables: Map<string, Instances>
	coproduct: Store
	components: Map<string, string>
	inverse: Map<string, Set<string>>
	pushout: Store
}>

type TypeMap = Map<
	string,
	Readonly<{
		type: string
		shapeExpr: TypeOf<typeof Schema>["shapes"][0]
		key?: string
	}>
>

export function getTypeMap(schema: TypeOf<typeof Schema>): TypeMap {
	return new Map(
		schema.shapes.map((shapeExpr) => {
			const {
				id,
				shapeExprs: [_, shape],
			} = shapeExpr

			const [
				{
					valueExpr: {
						values: [type],
					},
				},
			] = getExpressions(shape)

			const value: {
				shapeExpr: typeof shapeExpr
				type: string
				key?: string
			} = { type, shapeExpr }

			if (!isEmptyProductShape(shape) && shape.annotations !== undefined) {
				const [{ object }] = shape.annotations
				value.key = object
			}

			return [id, Object.freeze(value)]
		})
	)
}
