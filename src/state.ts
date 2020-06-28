import RDF from "rdf-js"
import { N3Store } from "n3"
import { TypeOf } from "io-ts/es6/index.js"
import { Schema, getExpressions, isEmptyProductShape } from "./schema.js"
import { Order } from "./order.js"

export type Node = RDF.Quad_Object | Readonly<Tree>
export type Property = {
	order: Order
	values: Array<Node>
	min: number
	max: number
	reference?: string
	withReference?: string
	graphs?: Map<string, Set<string>>
}

export interface Tree {
	termType: "Tree"
	subject: RDF.Quad_Subject
	properties: Map<string, Property>
}

export const getNodeTerm = (node: Node) =>
	node.termType === "Tree" ? node.subject : node

export type State = Readonly<{
	references: Map<string, [string, string][][]>
	metaReferences: Map<string, [string, string][][]>
	path: [string, string][]
	types: TypeMap
	tables: Map<string, Map<string, Tree>>
	coproduct: N3Store
	components: Map<string, string>
	inverse: Map<string, Set<string>>
	pushout: N3Store
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
