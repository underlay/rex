// import RDF from "rdf-js"
// import { DataFactory } from "n3"
// import { TypeOf } from "io-ts/es6/index.js"

// import { Schema } from "./schema.js"
// import { cospan } from "./cospan.js"

// import { toId, fromId } from "./utils.js"

// import { Tree, getTypeMap, State, getNodeTerm, Node } from "./state.js"
// import { matchShape, image, preImage } from "./match.js"
// import { collect } from "./collect.js"
// import { rdfTypeNode } from "./vocab.js"
// import { Order } from "./order.js"

// function trim(node: Node, state: State): boolean {
// 	if (node.termType === "Tree") {
// 		for (const [predicate, property] of node.properties) {
// 			const { graphs, reference, withReference } = property
// 			if (graphs !== undefined && reference !== undefined) {
// 				const table = state.tables.get(reference)!
// 				if (withReference === undefined) {
// 					property.values = property.values.filter((node) => {
// 						const id = toId(getNodeTerm(node))
// 						const graph = graphs.get(id)!
// 						for (const name of graph) {
// 							const { value } = image(fromId(name), state)
// 							if (!table.has(value)) {
// 								graph.delete(name)
// 							}
// 						}
// 						if (graph.size === 0) {
// 							graphs.delete(id)
// 							return false
// 						}
// 						return true
// 					})
// 				} else {
// 					const ids: Map<string, RDF.Quad_Object> = new Map()
// 					const p = DataFactory.namedNode(withReference)
// 					let order: Order | null = null
// 					for (const tree of table.values()) {
// 						const withProperty = tree.properties.get(withReference)
// 						if (withProperty !== undefined) {
// 							if (order === null) {
// 								order = withProperty.order
// 							} else if (withProperty.order !== order) {
// 								throw new Error("Mismatching orders")
// 							}

// 							for (const value of withProperty.values) {
// 								if (value.termType !== "Literal") {
// 									throw new Error(
// 										"Only literal meta properties can be referenced"
// 									)
// 								}
// 								const coSubjects = state.coproduct.getSubjects(
// 									p,
// 									getNodeTerm(value),
// 									null
// 								)
// 								for (const coGraph of coSubjects) {
// 									const component = state.components.get(coGraph.value)
// 									if (
// 										coGraph.termType === "BlankNode" &&
// 										component === tree.subject.value
// 									) {
// 										for (const coSubject of preImage(node.subject, state)) {
// 											const coObjects = state.coproduct.getObjects(
// 												coSubject,
// 												predicate,
// 												coGraph
// 											)

// 											for (const term of coObjects) {
// 												const id = toId(term)
// 												const min = ids.get(id)
// 												if (
// 													min === undefined ||
// 													withProperty.order(value, min)
// 												) {
// 													ids.set(id, value)
// 												}
// 											}
// 										}
// 									}
// 								}
// 							}
// 						}
// 					}

// 					property.values = property.values.filter((value) =>
// 						ids.has(toId(getNodeTerm(value)))
// 					)

// 					property.order = (a: Node, b: Node) => {
// 						const A = ids.get(toId(getNodeTerm(a)))!
// 						const B = ids.get(toId(getNodeTerm(b)))!
// 						return order!(A, B)
// 					}
// 				}
// 			}
// 			property.values = property.values.filter((node) => trim(node, state))
// 			if (property.values.length < property.min) {
// 				return false
// 			}
// 		}
// 	}
// 	return true
// }

// function deleteReference(
// 	shape: string,
// 	subjectValue: string,
// 	references: Map<string, [string, string][][]>
// ) {
// 	for (const [key, refs] of references) {
// 		for (const [i, [[refShape, refSubject]]] of refs.entries()) {
// 			if (refShape === shape && refSubject === subjectValue) {
// 				refs.splice(i, 1)
// 			}
// 		}
// 		if (refs.length === 0) {
// 			references.delete(key)
// 		}
// 	}
// }

// function handleDelete(shape: string, subjectValue: string, state: State) {
// 	state.tables.get(shape)!.delete(subjectValue)
// 	deleteReference(shape, subjectValue, state.references)
// 	deleteReference(shape, subjectValue, state.metaReferences)

// 	const key = `${shape}\t${subjectValue}`
// 	const references = state.references.get(key)
// 	if (references !== undefined) {
// 		for (const [[refShape, refSubject], ...values] of references) {
// 			const tree = state.tables.get(refShape)!.get(refSubject)!
// 			const valid = percolate(tree, values)
// 			if (!valid) {
// 				handleDelete(refShape, refSubject, state)
// 			}
// 		}
// 	}

// 	const metaReferences = state.metaReferences.get(key)
// 	if (metaReferences !== undefined) {
// 		for (const [[refShape, refSubject], ...values] of metaReferences) {
// 			const tree = state.tables.get(refShape)!.get(refSubject)!
// 			const valid = percolateMeta(subjectValue, tree, values)
// 			if (!valid) {
// 				handleDelete(refShape, refSubject, state)
// 			}
// 		}
// 	}
// }

// function percolate(
// 	tree: Tree,
// 	[[predicate, object], ...values]: [string, string][]
// ): boolean {
// 	const property = tree.properties.get(predicate)!
// 	if (values.length === 0) {
// 		const index = property.values.findIndex(
// 			(node) => toId(getNodeTerm(node)) === object
// 		)
// 		if (index !== -1) {
// 			property.values.splice(index, 1)
// 		}
// 	} else {
// 		property.values = property.values.filter(
// 			(node) => node.termType !== "Tree" || percolate(node, values)
// 		)
// 	}
// 	return property.values.length >= property.min
// }

// function percolateMeta(
// 	subjectValue: string,
// 	tree: Tree,
// 	[[predicate, object], ...values]: [string, string][]
// ): boolean {
// 	const property = tree.properties.get(predicate)!
// 	if (values.length === 0) {
// 		if (property.reference !== undefined && property.graphs !== undefined) {
// 			const graphs = property.graphs.get(object)!
// 			graphs.delete(subjectValue)
// 			if (graphs.size === 0) {
// 				return false
// 			}
// 		}
// 	} else {
// 		property.values = property.values.filter(
// 			(node) =>
// 				node.termType !== "Tree" || percolateMeta(subjectValue, node, values)
// 		)
// 	}
// 	return property.values.length >= property.min
// }

// function populateDataset({ subject, properties }: Tree, dataset: RDF.Quad[]) {
// 	for (const [key, property] of properties) {
// 		const predicate = DataFactory.namedNode(key)
// 		for (const node of collect(property)) {
// 			dataset.push(DataFactory.quad(subject, predicate, getNodeTerm(node)))
// 			if (node.termType === "Tree") {
// 				populateDataset(node, dataset)
// 			}
// 		}
// 	}
// }

// export function materialize(
// 	schema: TypeOf<typeof Schema>,
// 	datasets: RDF.Quad[][]
// ): RDF.Quad[] {
// 	const types = getTypeMap(schema)
// 	const state: State = Object.freeze(
// 		Object.assign(
// 			{
// 				types,
// 				tables: new Map(),
// 				path: [],
// 				references: new Map(),
// 				metaReferences: new Map(),
// 			},
// 			cospan(types, datasets)
// 		)
// 	)

// 	for (const [id, { type, shapeExpr }] of types) {
// 		const table: Map<string, Tree> = new Map()
// 		const subjects = state.pushout.getSubjects(
// 			rdfTypeNode,
// 			DataFactory.namedNode(type),
// 			null
// 		)

// 		for (const subject of subjects) {
// 			state.path.push([id, subject.value])
// 			const tree = matchShape(subject, shapeExpr.shapeExprs[1], state)
// 			if (tree !== null) {
// 				table.set(subject.value, tree)
// 			}
// 			state.path.pop()
// 		}

// 		state.tables.set(id, table)
// 	}

// 	// First we trim minimums
// 	for (const [shape, table] of state.tables) {
// 		for (const [subjectValue, tree] of table) {
// 			const valid = trim(tree, state)
// 			if (!valid) {
// 				handleDelete(shape, subjectValue, state)
// 			}
// 		}
// 	}

// 	// Then we sort, take maximums, and populate
// 	const dataset: RDF.Quad[] = []
// 	for (const table of state.tables.values()) {
// 		for (const tree of table.values()) {
// 			populateDataset(tree, dataset)
// 		}
// 	}

// 	return dataset
// }
