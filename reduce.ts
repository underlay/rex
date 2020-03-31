import { N3Store, Quad_Subject, Quad_Predicate, Store } from "n3"
import ShExCore from "@shex/core"
import {
	parseObjectValue,
	parseAnnotations,
	objectValueUnion,
	fromId,
	defaults,
	rex,
	getTripleExprObject,
	getShapeExprObject
} from "./util"

export function merge(
	schema: Schema,
	maps: Map<ShExCore.Start | shapeExprRef, Set<string>>,
	...stores: N3Store[]
): N3Store {
	const union = new Store()
	for (const store of stores) {
		for (const quad of store.getQuads(null, null, null, null)) {
			union.addQuad(quad)
		}
	}

	const index = ShExCore.Util.index(schema)
	const dbs = stores.map(db => ShExCore.Util.makeN3DB(db))
	// const [dbA, dbB] = [ShExCore.Util.makeN3DB(a), ShExCore.Util.makeN3DB(b)]
	for (const [shape, nodes] of maps.entries()) {
		const shapeExpr = typeof shape === "string" ? shape : schema.start
		const shapeExprObject = getShapeExprObject(shapeExpr, index)
		if (shapeExprObject.type === "Shape") {
			const expression = getTripleExprObject(shapeExprObject.expression, index)
			for (const node of nodes.values()) {
				const validators = stores.map(_ => ShExCore.Validator.construct(schema))
				const results = dbs.map((db, i) =>
					validators[i].validate(db, node, shape)
				)
				console.log(results)
				const failed = results.findIndex(({ type }) => type === "Failure")
				if (failed >= 0) {
					console.error(`${node} failed ${JSON.stringify(shape)} validation`)
					console.error(results[failed])
				} else {
					const r = results as ShExCore.ShapeTestT[]
					const solutions = r.map(({ solution }) => solution)
					splice(index, union, expression, solutions)
				}
			}
		}
	}
	return union
}

function splice<T>(
	index: ShExCore.Index,
	union: N3Store,
	tripleExprObject: tripleExprObject,
	solutions: ShExCore.solutions<T>[]
) {
	if (
		tripleExprObject.type === "EachOf" &&
		solutions.every(({ type }) => type === "EachOfSolutions")
	) {
		const s = solutions as ShExCore.EachOfSolutions<T>[]
		for (const [i, tripleExpr] of tripleExprObject.expressions.entries()) {
			// TODO: think about when and why there are multiple solutions
			splice(
				index,
				union,
				getTripleExprObject(tripleExpr, index),
				s.map(({ solutions: [{ expressions }] }) => expressions[i])
			)
		}
	} else if (
		tripleExprObject.type === "OneOf" &&
		solutions.every(({ type }) => type === "OneOfSolutions")
	) {
		const s = solutions as ShExCore.OneOfSolutions<T>[]
	} else if (
		tripleExprObject.type === "TripleConstraint" &&
		solutions.every(({ type }) => type === "TripleConstraintSolutions")
	) {
		const s = solutions as ShExCore.TripleConstraintSolutions<T>[]

		const min = tripleExprObject.hasOwnProperty("min")
			? tripleExprObject.min
			: 1

		const max = tripleExprObject.hasOwnProperty("max")
			? tripleExprObject.max === -1
				? Infinity
				: tripleExprObject.max
			: 1

		console.log("schema", tripleExprObject, min, max)

		const values = objectValueUnion(s.map(({ solutions }) => solutions))

		if (min <= values.length && values.length <= max) {
			// Great
		} else if (values.length > max) {
			const annotations = parseAnnotations(tripleExprObject)
			const fillSource = annotations.has(rex.fill) ? annotations : defaults
			const fill = fillSource.get(rex.fill)

			let start: number, end: number
			if (fill === rex.right) {
				start = 0
				end = values.length - max
			} else if (fill === rex.left) {
				start = max
				end = values.length
			}

			for (const { subject, predicate, object } of values.slice(start, end)) {
				console.log(subject, predicate, object)
				const s = fromId(subject) as Quad_Subject
				const p = fromId(predicate) as Quad_Predicate
				const o = parseObjectValue(object)
				console.log(s, p, o)
				union.removeQuad(s, p, o)
			}
		} else {
			// ???
		}
	}
}
