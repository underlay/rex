import t from "./io.js"

import {
	Store,
	Quad,
	NamedNode,
	BlankNode,
	Object,
	Term,
	Subject,
	D,
} from "n3.ts"

import {
	Schema,
	AnnotatedTripleConstraint,
	isReferenceAnnotation,
	sortReference,
	TripleConstraint,
	isDataTypeConstraint,
	isMetaReferenceAnnotation,
	isDatatypeAnnotation,
	shapeExpr,
} from "./schema.js"
import { State, Entry, Instance, getState, Shape } from "./state.js"

import nodeSatisfies from "./satisfies.js"
import { toId, fromId, getRange, preImage, image } from "./utils.js"
import { getTypeOrder, getOrder, Order } from "./order.js"
import { collect } from "./collect.js"
import { Table } from "./table.js"

export function materialize(
	schema: t.TypeOf<typeof Schema>,
	coproduct: Store
): [Map<string, string[]>, Map<string, Table>] {
	const state = getState(schema, coproduct)
	for (const [id, { expressions }] of state.shapes) {
		const instanceMap: Map<string, Instance[]> = new Map()
		for (const subject of state.pushout.subjects(null, null, null)) {
			if (subject.termType !== "BlankNode") {
				continue
			}
			const instance = instantiate(id, subject, expressions, state)
			if (instance !== null) {
				instanceMap.set(subject.value, instance)
				for (const expression of expressions) {
					const graph = getGraphReference(expression)
					if (graph !== null) {
					}
				}
			}
		}
		state.instances.set(id, instanceMap)
	}

	for (const [id, { expressions }] of state.shapes) {
		const instanceMap = state.instances.get(id)!
		for (const [i, expression] of expressions.entries()) {
			if (typeof expression.valueExpr === "string") {
				for (const [value, instances] of instanceMap) {
					const referenceMap = state.instances.get(expression.valueExpr)
					if (referenceMap === undefined) {
						throw new Error(`No reference table found: ${expression.valueExpr}`)
					}

					for (const objectId of instances[i].values.keys()) {
						const { value: objectValue } = fromId(objectId)

						if (!referenceMap.has(objectValue)) {
							instances[i].values.delete(objectId)
						}
					}

					if (instances[i].values.size < instances[i].min) {
						handleDelete(id, value, state)
					}
				}
			}

			const graph = getGraphReference(expression)

			if (graph !== null) {
				const graphMap = state.instances.get(graph)
				if (graphMap === undefined) {
					throw new Error(`No graph table found: ${graph}`)
				}

				for (const [subject, instance] of instanceMap) {
					for (const [object, graphs] of instance[i].values) {
						for (const name of graphs) {
							if (!graphMap.has(getComponent(name, state))) {
								graphs.delete(name)
							}
						}
						if (graphs.size == 0) {
							instance[i].values.delete(object)
						}
					}
					if (instance[i].values.size < instance[i].min) {
						handleDelete(id, subject, state)
					}
				}

				if (isMetaReferenceAnnotation(expression)) {
					// Here we check to make sure that the *objects*
					// for each graph referenced actually exist
					const [{ object: meta }, { object: sort }] = expression.annotations
					const graphShape = state.shapes.get(graph)
					if (graphShape === undefined) {
						throw new Error(`Could not find shape with id: ${graph}`)
					}

					const metaTerm = new NamedNode(meta)

					const index = graphShape.expressions.findIndex(
						({ predicate }) => predicate === meta
					)

					if (index === -1 || index === i) {
						throw new Error(`Could not find expression with predicate: ${meta}`)
					}

					const graphExpression = graphShape.expressions[index]
					const order = getOrder(
						sort,
						isDatatypeAnnotation(graphExpression)
							? graphExpression.valueExpr.datatype
							: null
					)

					for (const [subject, instance] of instanceMap) {
						const metaReferences: Map<string, Object<D>> = new Map()
						for (const [object, graphs] of instance[i].values) {
							let max: Object<D> | null = null

							const graphNames: Set<string> = new Set()
							for (const name of graphs) {
								graphNames.add(getComponent(name, state))
							}

							for (const name of graphNames) {
								const graphInstances = graphMap.get(name)!

								for (const valueId of graphInstances[index].values.keys()) {
									const term = fromId(valueId) as Object<D>
									const s = state.coproduct.subjects(metaTerm, term, null)
									for (const preSubject of s) {
										if (
											preSubject.termType === "BlankNode" &&
											getComponent(preSubject.value, state) === name &&
											graphs.has(preSubject.value)
										) {
											// if (max === null || order(term, max)) {
											// 	max = term
											// }
										}
									}
								}
							}

							if (max !== null) {
								metaReferences.set(object, max)
							} else {
								instance[i].values.delete(object)
								if (instance[i].values.size < instance[i].min) {
									handleDelete(id, subject, state)
								}
							}
						}
						// instance[i].order = (a: Term<D>, b: Term<D>) => {
						// 	const A = metaReferences.get(toId(a))!
						// 	const B = metaReferences.get(toId(b))!
						// 	return order(A, B)
						// }
					}
				}
			}
		}
	}

	// Now state is complete, so we trim maximums and sort
	const result: Map<string, Table> = new Map()
	for (const [id, instanceMap] of state.instances) {
		const r1: Table = new Map()
		result.set(id, r1)
		for (const [subject, instances] of instanceMap) {
			const r2: Set<string>[] = []
			r1.set(subject, r2)
			for (const instance of instances) {
				const r3: Set<string> = new Set()
				r2.push(r3)
				for (const object of collect(instance)) {
					r3.add(toId(object))
				}
			}
		}
	}

	const headers = new Map(
		Array.from(state.shapes).map(([id, { expressions }]) => [
			id,
			expressions.map(({ predicate }) => predicate),
		])
	)

	return [headers, result]
}

export function* getQuads(table: Table, header: string[]): Generator<Quad> {
	for (const [id, properties] of table) {
		const subject = new BlankNode(id)
		for (const [i, values] of properties.entries()) {
			for (const value of values) {
				const object = fromId(value) as Object<D>
				yield new Quad(subject, new NamedNode(header[i]), object)
			}
		}
	}
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
	const instanceMap = state.instances.get(shape)!
	const old = instanceMap.get(value)
	if (old === undefined) {
		return
	}

	instanceMap.delete(value)

	const key = `${shape}\t${value}`
	const refs = state.references.get(key)
	if (refs !== undefined) {
		for (const [referenceId, subject, property, id] of refs) {
			const referenceMap = state.instances.get(referenceId)!
			const instances = referenceMap.get(subject)
			if (instances !== undefined) {
				instances[property].values.delete(id)
				if (instances[property].values.size < instances[property].min) {
					handleDelete(referenceId, subject, state)
				}
			}
		}
	}

	const metaRefs = state.metaReferences.get(key)
	if (metaRefs !== undefined) {
		for (const [referenceId, subject, property, id] of metaRefs) {
			const referenceMap = state.instances.get(referenceId)!
			const instances = referenceMap.get(subject)
			if (instances !== undefined) {
				const graphs = instances[property].values.get(id)
				if (graphs !== undefined) {
					graphs.delete(value)
					if (graphs.size === 0) {
						handleDelete(referenceId, subject, state)
					}
				}
			}
		}
	}
}

function instantiate(
	shape: string,
	subject: BlankNode,
	expressions: AnnotatedTripleConstraint[],
	state: State
): Instance[] | null {
	const instances: Instance[] = new Array(expressions.length)
	const references: Map<number, TripleConstraint & sortReference> = new Map()
	for (const [i, expression] of expressions.entries()) {
		const { valueExpr } = expression
		const { min, max } = getRange(expression.min, expression.max)
		const predicate = new NamedNode(expression.predicate)

		const objects = Array.from(getObjects(subject, predicate, valueExpr, state))
		if (objects.length < min) {
			return null
		}

		if (typeof valueExpr === "string" && objects.length > 0) {
			for (const object of objects as BlankNode[]) {
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
				for (const preObject of preImage<Object<D>>(object, state)) {
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
		const { valueExpr } = expression
		const { min, max } = getRange(expression.min, expression.max)
		const [{ object: reference }, { object: sort }] = expression.annotations
		const index = expressions.findIndex(
			({ predicate }) => predicate === reference
		)
		const predicate = new NamedNode(expression.predicate)

		const nonValues: Set<string> = new Set()
		const referenceMap: Map<string, Object<D>[]> = new Map()
		const referenceExpr = expressions[index].valueExpr
		const order = getOrder(
			sort,
			isDataTypeConstraint(referenceExpr) ? referenceExpr.datatype : null
		)

		const referencePredicate = new NamedNode(reference)
		const values: Map<string, Set<string>> = new Map()
		for (const referenceId of instances[index].values.keys()) {
			const referenceObject = fromId(referenceId) as Object<D>
			for (const preSubject of preSubjects(
				subject,
				referencePredicate,
				referenceObject,
				state
			)) {
				const preObjects = state.coproduct.getObjects(
					preSubject,
					predicate,
					null
				)

				for (const preObject of preObjects) {
					const object = image<Object<D>>(preObject, state)
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

		// instances[i] = Object.freeze({
		// 	min,
		// 	max,
		// 	values,
		// 	order: (a: Term<D>, b: Term<D>) => {
		// 		const [A] = referenceMap.get(toId(a))!
		// 		const [B] = referenceMap.get(toId(b))!
		// 		if (a === undefined || b === undefined) {
		// 			throw new Error(`Unexpected values ${toId(a)}, ${toId(b)}`)
		// 		} else {
		// 			return order(A, B)
		// 		}
		// 	},
		// })
	}

	return instances
}

function insert(order: Order, terms: Term<D>[], term: Term<D>) {
	// const i = terms.findIndex((t) => order(term, t))
	// if (i === -1) {
	// 	terms.push(term)
	// } else {
	// 	terms.splice(i, 0, term)
	// }
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
	subject: BlankNode,
	predicate: NamedNode,
	preObject: Object<D>,
	state: State
): Generator<BlankNode, void> {
	for (const term of state.coproduct.subjects(predicate, preObject, null)) {
		if (term.termType === "BlankNode") {
			if (getComponent(term.value, state) === subject.value) {
				yield term
			}
		}
	}
}

const getGraphs = (
	preSubject: Subject<D>,
	predicate: NamedNode,
	preObject: Object<D>,
	state: State
): string[] =>
	state.coproduct
		.getGraphs(preSubject, predicate, preObject)
		.filter(({ termType }) => termType === "BlankNode")
		.map(({ value }) => value)

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

function* getObjects(
	subject: Subject<D>,
	predicate: NamedNode,
	valueExpr: shapeExpr,
	state: State
): Generator<Object<D>, void, undefined> {
	const blank = typeof valueExpr === "string"
	for (const object of state.pushout.objects(subject, predicate, null)) {
		if ((object.termType === "BlankNode") === blank) {
			yield object
		}
	}
}
