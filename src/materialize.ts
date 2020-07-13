import * as RDF from "rdf-js"
import { DataFactory, Store } from "n3"
import { TypeOf } from "io-ts/es6/index.js"

import {
	Schema,
	getExpressions,
	AnnotatedTripleConstraint,
	isReferenceAnnotation,
	sortReference,
	TripleConstraint,
	isDataTypeConstraint,
	isMetaReferenceAnnotation,
	isDatatypeAnnotation,
	shapeExpr,
} from "./schema.js"
import { State, Entry, Instances, getTypeMap, Instance } from "./state.js"
import { rdfTypeNode } from "./vocab.js"

import nodeSatisfies from "./satisfies.js"
import { toId, fromId, getRange, preImage, image } from "./utils.js"
import { getTypeOrder, getOrder, Order } from "./order.js"
import { getCospan } from "./pushout.js"
import { collect } from "./collect.js"

export type Table = Map<string, Map<string, Set<string>>>
export function materialize(
	s: TypeOf<typeof Schema>,
	coproduct: Store
): Map<string, Table> {
	const types = getTypeMap(s)
	const state: State = Object.freeze(
		Object.assign(
			{
				types,
				tables: new Map(),
				path: [],
				references: new Map(),
				metaReferences: new Map(),
			},
			getCospan(types, coproduct)
		)
	)

	for (const shapeAnd of s.shapes) {
		const [{}, product] = shapeAnd.shapeExprs
		const [{ valueExpr }, ...expressions] = getExpressions(product)
		const [type] = valueExpr.values
		const subjects = state.pushout.getSubjects(
			rdfTypeNode,
			DataFactory.namedNode(type),
			null
		)

		const instances: Instances = new Map()
		for (const subject of subjects) {
			if (subject.termType !== "BlankNode") {
				continue
			}
			const instance = instantiate(shapeAnd.id, subject, expressions, state)
			if (instance !== null) {
				instances.set(subject.value, instance)
				for (const expression of expressions) {
					const graph = getGraphReference(expression)
					if (graph !== null) {
					}
				}
			}
		}
		state.tables.set(shapeAnd.id, instances)
	}

	for (const shapeAnd of s.shapes) {
		const instances = state.tables.get(shapeAnd.id)!
		const [{}, product] = shapeAnd.shapeExprs
		const [{}, ...expressions] = getExpressions(product)
		for (const [i, expression] of expressions.entries()) {
			if (typeof expression.valueExpr === "string") {
				for (const [value, instance] of instances) {
					const referenceTable = state.tables.get(expression.valueExpr)
					if (referenceTable === undefined) {
						throw new Error(`No reference table found: ${expression.valueExpr}`)
					}

					for (const objectId of instance[i].values.keys()) {
						const { value: objectValue } = fromId(objectId)
						if (!referenceTable.has(objectValue)) {
							instance[i].values.delete(objectId)
						}
					}

					if (instance[i].values.size < instance[i].min) {
						handleDelete(shapeAnd.id, value, state)
					}
				}
			}

			const graph = getGraphReference(expression)

			if (graph !== null) {
				const graphTable = state.tables.get(graph)
				if (graphTable === undefined) {
					throw new Error(`No graph table found: ${graph}`)
				}

				for (const [subject, instance] of instances) {
					for (const [object, graphs] of instance[i].values) {
						for (const name of graphs) {
							if (!graphTable.has(getComponent(name, state))) {
								graphs.delete(name)
							}
						}
						if (graphs.size == 0) {
							instance[i].values.delete(object)
						}
					}
					if (instance[i].values.size < instance[i].min) {
						handleDelete(shapeAnd.id, subject, state)
					}
				}

				if (isMetaReferenceAnnotation(expression)) {
					// Here we check to make sure that the *objects*
					// for each graph referenced actually exist
					const [{ object: meta }, { object: sort }] = expression.annotations
					const {
						shapeExprs: [{}, graphProduct],
					} = s.shapes.find(({ id }) => graph === id)!
					const [{}, ...graphExpressions] = getExpressions(graphProduct)
					const index = graphExpressions.findIndex(
						({ predicate }) => predicate === meta
					)

					if (index === -1 || index === i) {
						throw new Error(`Could not find expression with predicate: ${meta}`)
					}

					const graphExpression = graphExpressions[index]
					const order = getOrder(
						sort,
						isDatatypeAnnotation(graphExpression)
							? graphExpression.valueExpr.datatype
							: null
					)

					for (const [subject, instance] of instances) {
						const metaReferences: Map<string, RDF.Quad_Object> = new Map()
						for (const [object, graphs] of instance[i].values) {
							let max: RDF.Quad_Object | null = null

							const graphNames: Set<string> = new Set()
							for (const name of graphs) {
								graphNames.add(getComponent(name, state))
							}

							for (const name of graphNames) {
								const graphInstance = graphTable.get(name)!

								for (const valueId of graphInstance[index].values.keys()) {
									const term = fromId(valueId) as RDF.Quad_Object
									const s = state.coproduct.getSubjects(meta, term, null)
									for (const preSubject of s) {
										if (
											preSubject.termType === "BlankNode" &&
											getComponent(preSubject.value, state) === name &&
											graphs.has(preSubject.value)
										) {
											if (max === null || order(term, max)) {
												max = term
											}
										}
									}
								}
							}

							if (max !== null) {
								metaReferences.set(object, max)
							} else {
								instance[i].values.delete(object)
								if (instance[i].values.size < instance[i].min) {
									handleDelete(shapeAnd.id, subject, state)
								}
							}
						}
						instance[i].order = (a: RDF.Term, b: RDF.Term) => {
							const A = metaReferences.get(toId(a))!
							const B = metaReferences.get(toId(b))!
							return order(A, B)
						}
					}
				}
			}
		}
	}

	// Now state is complete, so we trim maximums and sort
	const result: Map<string, Table> = new Map()
	for (const shapeAnd of s.shapes) {
		const [{}, product] = shapeAnd.shapeExprs
		const [{}, ...expressions] = getExpressions(product)
		const table = state.tables.get(shapeAnd.id)!
		const r1: Table = new Map()
		result.set(shapeAnd.id, r1)
		for (const [subject, instances] of table) {
			const r2: Map<string, Set<string>> = new Map()
			r1.set(subject, r2)
			for (const [i, { predicate }] of expressions.entries()) {
				const r3: Set<string> = new Set()
				r2.set(predicate, r3)
				for (const object of collect(instances[i])) {
					r3.add(toId(object))
				}
			}
		}
	}

	return result
}

export function getDataset(
	s: TypeOf<typeof Schema>,
	tables: Map<string, Table>
): RDF.Quad[] {
	const dataset: RDF.Quad[] = []
	for (const shapeAnd of s.shapes) {
		const [{}, product] = shapeAnd.shapeExprs
		const [{ valueExpr }] = getExpressions(product)
		const {
			values: [type],
		} = valueExpr
		const t = DataFactory.namedNode(type)
		for (const [id, properties] of tables.get(shapeAnd.id)!) {
			const subject = DataFactory.blankNode(id)
			dataset.push(DataFactory.quad(subject, rdfTypeNode, t))
			for (const [property, values] of properties) {
				const predicate = DataFactory.namedNode(property)
				for (const value of values) {
					const object = fromId(value) as RDF.Quad_Object
					dataset.push(DataFactory.quad(subject, predicate, object))
				}
			}
		}
	}
	return dataset
}

const getComponent = (value: string, state: State) =>
	state.components.get(value) || value

function getGraphReference(
	expression: AnnotatedTripleConstraint
): string | null {
	if (isReferenceAnnotation(expression)) {
		const [{}, {}, graph] = expression.annotations
		if (graph !== undefined) {
			return graph.object
		}
	} else if (isMetaReferenceAnnotation(expression)) {
		const [{}, {}, graph] = expression.annotations
		return graph.object
	} else if (
		isDataTypeConstraint(expression.valueExpr) &&
		expression.annotations !== undefined &&
		expression.annotations.length > 1
	) {
		const [{}, graph] = expression.annotations
		if (graph !== undefined) {
			return graph.object
		}
	}
	return null
}

function handleDelete(shape: string, value: string, state: State) {
	const table = state.tables.get(shape)!
	const old = table.get(value)
	if (old === undefined) {
		return
	}

	table.delete(value)

	const key = `${shape}\t${value}`
	const refs = state.references.get(key)
	if (refs !== undefined) {
		for (const [referenceShape, subject, property, id] of refs) {
			const referenceTable = state.tables.get(referenceShape)!
			const instance = referenceTable.get(subject)
			if (instance !== undefined) {
				instance[property].values.delete(id)
				if (instance[property].values.size < instance[property].min) {
					handleDelete(referenceShape, subject, state)
				}
			}
		}
	}

	const metaRefs = state.metaReferences.get(key)
	if (metaRefs !== undefined) {
		for (const [referenceShape, subject, property, id] of metaRefs) {
			const referenceTable = state.tables.get(referenceShape)!
			const instance = referenceTable.get(subject)
			if (instance !== undefined) {
				const graphs = instance[property].values.get(id)
				if (graphs !== undefined) {
					graphs.delete(value)
					if (graphs.size === 0) {
						handleDelete(referenceShape, subject, state)
					}
				}
			}
		}
	}
}

function instantiate(
	shape: string,
	subject: RDF.BlankNode,
	expressions: AnnotatedTripleConstraint[],
	state: State
): Instance[] | null {
	const instances: Instance[] = new Array(expressions.length)
	const references: Map<number, TripleConstraint & sortReference> = new Map()
	for (const [i, expression] of expressions.entries()) {
		const { predicate, valueExpr } = expression
		const { min, max } = getRange(expression.min, expression.max)

		const objects = getObjects(subject, predicate, valueExpr, state)
		if (objects.length < min) {
			return null
		}

		if (typeof valueExpr === "string" && objects.length > 0) {
			for (const object of objects as RDF.BlankNode[]) {
				const entry: Entry = [shape, subject.value, i, toId(object)]
				addReference(valueExpr, object.value, entry, state.references)
			}
		}

		if (isReferenceAnnotation(expression)) {
			references.set(i, expression)
			continue
		}

		const values: Map<string, Set<string>> = new Map()
		for (const object of objects) {
			const objectId = toId(object)

			if (typeof valueExpr === "string" || nodeSatisfies(object, valueExpr)) {
				for (const preObject of preImage<RDF.Quad_Object>(object, state)) {
					for (const s of preSubjects(subject, predicate, preObject, state)) {
						const graphs = getGraphs(s, predicate, preObject, state)
						if (graphs.length > 0) {
							addToSet(values, objectId, ...graphs)
						}
					}
				}
			}
		}

		if (values.size < min) {
			return null
		}

		const graph = getGraphReference(expression)
		if (graph !== null) {
			for (const [value, graphs] of values) {
				const entry: Entry = [shape, subject.value, i, value]
				for (const graph of graphs) {
					const g = getComponent(graph, state)
					addReference(shape, g, entry, state.metaReferences)
				}
			}
		}

		if (isMetaReferenceAnnotation(expression)) {
			instances[i] = {
				values,
				order: (undefined as unknown) as Order, // I'll do this later
				min,
				max,
			}
		} else {
			instances[i] = Object.freeze({
				values,
				order: getTypeOrder(expression),
				min,
				max,
			})
		}
	}

	for (const [i, expression] of references) {
		const { predicate, valueExpr } = expression
		const { min, max } = getRange(expression.min, expression.max)
		const [{ object: reference }, { object: sort }] = expression.annotations
		const index = expressions.findIndex(
			({ predicate }) => predicate === reference
		)

		const nonValues: Set<string> = new Set()
		const referenceMap: Map<string, RDF.Quad_Object[]> = new Map()
		const referenceExpr = expressions[index].valueExpr
		const order = getOrder(
			sort,
			isDataTypeConstraint(referenceExpr) ? referenceExpr.datatype : null
		)

		const values: Map<string, Set<string>> = new Map()
		for (const referenceId of instances[index].values.keys()) {
			const referenceObject = fromId(referenceId) as RDF.Quad_Object
			for (const preSubject of preSubjects(
				subject,
				reference,
				referenceObject,
				state
			)) {
				const preObjects = state.coproduct.getObjects(
					preSubject,
					predicate,
					null
				)

				for (const preObject of preObjects) {
					const object = image<RDF.Quad_Object>(preObject, state)
					const objectId = toId(object)
					if (nonValues.has(objectId)) {
						continue
					}

					const graphs = getGraphs(preSubject, predicate, preObject, state)
					if (values.has(objectId)) {
						addToSet(values, objectId, ...graphs)
					} else if (
						typeof valueExpr === "string" ||
						nodeSatisfies(object, valueExpr)
					) {
						addToSet(values, objectId, ...graphs)
						const ref = referenceMap.get(objectId)
						if (ref === undefined) {
							referenceMap.set(objectId, [referenceObject])
						} else {
							insert(order, ref, referenceObject)
						}
					} else {
						nonValues.add(objectId)
					}
				}
			}
		}

		if (values.size < min) {
			return null
		}

		instances[i] = Object.freeze({
			min,
			max,
			values,
			order: (a: RDF.Term, b: RDF.Term) => {
				const [A] = referenceMap.get(toId(a))!
				const [B] = referenceMap.get(toId(b))!
				if (a === undefined || b === undefined) {
					throw new Error(`Unexpected values ${toId(a)}, ${toId(b)}`)
				} else {
					return order(A, B)
				}
			},
		})
	}

	return instances
}

function insert(order: Order, terms: RDF.Term[], term: RDF.Term) {
	const i = terms.findIndex((t) => order(term, t))
	if (i === -1) {
		terms.push(term)
	} else {
		terms.splice(i, 0, term)
	}
}

function addToSet(
	map: Map<string, Set<string>>,
	key: string,
	...values: string[]
) {
	const set = map.get(key)
	if (set === undefined) {
		map.set(key, new Set(values))
	} else {
		for (const value of values) {
			set.add(value)
		}
	}
}

function* preSubjects(
	subject: RDF.BlankNode,
	predicate: string,
	preObject: RDF.Quad_Object,
	state: State
): Generator<RDF.BlankNode, void> {
	const terms = state.coproduct.getSubjects(predicate, preObject, null)
	for (const term of terms) {
		if (term.termType === "BlankNode") {
			if (getComponent(term.value, state) === subject.value) {
				yield term
			}
		}
	}
}

const getGraphs = (
	preSubject: RDF.Quad_Subject,
	predicate: string,
	preObject: RDF.Quad_Object,
	state: State
): string[] =>
	state.coproduct
		.getGraphs(preSubject, predicate, preObject)
		.filter(({ termType }) => termType === "BlankNode")
		.map(({ value }) => value)
// .map(({ value }) => getComponent(value, state))

function addReference(
	shape: string,
	value: string,
	entry: Entry,
	references: Map<string, Entry[]>
) {
	const key = `${shape}\t${value}`
	const refs = references.get(key)
	if (refs === undefined) {
		references.set(key, [entry])
	} else {
		refs.push(entry)
	}
}

function getObjects(
	subject: RDF.Quad_Subject,
	predicate: string,
	valueExpr: shapeExpr,
	state: State
): RDF.Quad_Object[] {
	const objects = state.pushout.getObjects(subject, predicate, null)
	if (typeof valueExpr === "string") {
		return objects.filter(({ termType }) => termType === "BlankNode")
	} else {
		return objects
	}
}
