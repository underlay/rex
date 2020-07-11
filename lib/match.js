"use strict";
// import RDF from "rdf-js"
// import { DataFactory } from "n3"
// import {
// 	getExpressions,
// 	AnnotatedTripleConstraint,
// 	isDatatypeAnnotation,
// 	isReferenceAnnotation,
// 	isMetaReferenceAnnotation,
// 	sortBoolean,
// 	sortNumeric,
// 	sortTemporal,
// 	sortReference,
// 	sortMetaReference,
// 	shapeExpr,
// 	TripleConstraint,
// } from "./schema.js"
// import { State, Tree, Node, Property, getNodeTerm } from "./state.js"
// import { toId } from "./utils.js"
// import nodeSatisfies, { TypedLiteral } from "./satisfies.js"
// import { getTypeOrder, getLexicographicOrder, Order } from "./order.js"
// import { rdfTypeNode, rex } from "./vocab.js"
// export function* matchTripleConstraint(
// 	subject: RDF.Quad_Subject,
// 	{ predicate, valueExpr }: AnnotatedTripleConstraint,
// 	state: State
// ): Generator<Node, void, undefined> {
// 	const p = DataFactory.namedNode(predicate)
// 	const objects = state.pushout.getObjects(subject, p, null)
// 	for (const object of objects) {
// 		const node = matchValueExpr(predicate, object, valueExpr, state)
// 		if (node !== null) {
// 			yield node
// 		}
// 	}
// }
// function matchValueExpr(
// 	predicate: string,
// 	object: RDF.Quad_Object,
// 	valueExpr: shapeExpr | undefined,
// 	state: State
// ): Node | null {
// 	if (valueExpr === undefined) {
// 		return object
// 	} else if (typeof valueExpr === "string") {
// 		if (object.termType === "BlankNode") {
// 			const { type } = state.types.get(valueExpr)!
// 			const typeNode = DataFactory.namedNode(type)
// 			const n = state.pushout.countQuads(object, rdfTypeNode, typeNode, null)
// 			if (n > 0) {
// 				const path = state.path.concat([[predicate, toId(object)]])
// 				const key = `${valueExpr}\t${object.value}`
// 				const references = state.references.get(key)
// 				if (references === undefined) {
// 					state.references.set(key, [path])
// 				} else {
// 					references.push(path)
// 				}
// 				return object
// 			}
// 		}
// 	} else if (valueExpr.type === "NodeConstraint") {
// 		if (nodeSatisfies(object, valueExpr)) {
// 			return object
// 		}
// 	} else if (valueExpr.type === "ShapeAnd") {
// 		if (object.termType !== "Literal") {
// 			state.path.push([predicate, toId(object)])
// 			const tree = matchShape(object, valueExpr.shapeExprs[1], state)
// 			state.path.pop()
// 			return tree
// 		}
// 	}
// 	return null
// }
// export function matchShape(
// 	subject: RDF.Quad_Subject,
// 	shape: Shape,
// 	state: State
// ): Readonly<Tree> | null {
// 	const tree: Tree = { termType: "Tree", subject, properties: new Map() }
// 	const references: (TripleConstraint & sortReference)[] = []
// 	for (const tripleConstraint of getExpressions(shape)) {
// 		const { predicate, valueExpr, min, max } = tripleConstraint
// 		if (isDatatypeAnnotation(tripleConstraint)) {
// 			tree.properties.set(predicate, {
// 				...getRange(min, max),
// 				order: getTypeOrder(tripleConstraint),
// 				values: Array.from(
// 					matchTypedTripleConstraint(subject, tripleConstraint, state)
// 				),
// 			})
// 		} else if (isReferenceAnnotation(tripleConstraint)) {
// 			references.push(tripleConstraint)
// 		} else if (isMetaReferenceAnnotation(tripleConstraint)) {
// 			const [{ object: metaReference }, sort] = tripleConstraint.annotations
// 			if (sort === undefined) {
// 				let order: Order = (a: Node, b: Node) =>
// 					getNodeTerm(a).value < getNodeTerm(b).value
// 				const graphs: Map<string, Set<string>> = new Map()
// 				const property: Property = {
// 					...getRange(min, max),
// 					order: order,
// 					values: [],
// 					reference: metaReference,
// 					graphs: graphs,
// 				}
// 				const nullMatches: Set<string> = new Set()
// 				const p = DataFactory.namedNode(predicate)
// 				for (const coSubject of preImage(subject, state)) {
// 					const quads = state.coproduct.getQuads(coSubject, p, null, null)
// 					for (const { object, graph } of quads) {
// 						const id = toId(object)
// 						if (nullMatches.has(id)) {
// 							continue
// 						} else if (graphs.has(id)) {
// 							graphs.get(id)!.add(toId(graph))
// 						} else {
// 							const node = matchValueExpr(predicate, object, valueExpr, state)
// 							if (node === null) {
// 								nullMatches.add(id)
// 							} else {
// 								property.values.push(node)
// 								graphs.set(id, new Set([toId(graph)]))
// 							}
// 						}
// 					}
// 				}
// 				for (const [id, meta] of graphs) {
// 					const path = state.path.concat([[predicate, id]])
// 					for (const graph of meta) {
// 						const key = `${metaReference}\t${graph}`
// 						const references = state.metaReferences.get(key)
// 						if (references === undefined) {
// 							state.metaReferences.set(key, [path])
// 						} else {
// 							references.push(path)
// 						}
// 					}
// 				}
// 				tree.properties.set(predicate, property)
// 			} else if (sort.predicate === rex.with) {
// 				// sort.object
// 				let order: Order = (a: Node, b: Node) =>
// 					getNodeTerm(a).value < getNodeTerm(b).value
// 				const graphs: Map<string, Set<string>> = new Map()
// 				const property: Property = {
// 					...getRange(min, max),
// 					order: order,
// 					values: [],
// 					reference: metaReference,
// 					withReference: sort.object,
// 					graphs: graphs,
// 				}
// 				const nullMatches: Set<string> = new Set()
// 				const p = DataFactory.namedNode(predicate)
// 				for (const coSubject of preImage(subject, state)) {
// 					const quads = state.coproduct.getQuads(coSubject, p, null, null)
// 					for (const { object, graph } of quads) {
// 						const id = toId(object)
// 						if (nullMatches.has(id)) {
// 							continue
// 						} else if (graphs.has(id)) {
// 							graphs.get(id)!.add(toId(graph))
// 						} else {
// 							const node = matchValueExpr(predicate, object, valueExpr, state)
// 							if (node === null) {
// 								nullMatches.add(id)
// 							} else {
// 								property.values.push(node)
// 								graphs.set(id, new Set([toId(graph)]))
// 							}
// 						}
// 					}
// 				}
// 				for (const [id, meta] of graphs) {
// 					const path = state.path.concat([[predicate, id]])
// 					for (const graph of meta) {
// 						const key = `${metaReference}\t${graph}`
// 						const references = state.metaReferences.get(key)
// 						if (references === undefined) {
// 							state.metaReferences.set(key, [path])
// 						} else {
// 							references.push(path)
// 						}
// 					}
// 				}
// 				tree.properties.set(predicate, property)
// 			}
// 		} else {
// 			tree.properties.set(predicate, {
// 				...getRange(min, max),
// 				order: getLexicographicOrder(tripleConstraint),
// 				values: Array.from(
// 					matchTripleConstraint(subject, tripleConstraint, state)
// 				),
// 			})
// 		}
// 	}
// 	for (const tripleConstraint of references) {
// 		const {
// 			predicate,
// 			valueExpr,
// 			min,
// 			max,
// 			annotations: [{ object: referencePredicate }],
// 		} = tripleConstraint
// 		const reference = tree.properties.get(referencePredicate)
// 		if (reference === undefined) {
// 			throw new Error(`Reference property not found: ${referencePredicate}`)
// 		}
// 		const p = DataFactory.namedNode(predicate)
// 		const ref = DataFactory.namedNode(referencePredicate)
// 		const links: Map<string, Node> = new Map()
// 		const nullMatches: Set<string> = new Set()
// 		const values: Node[] = []
// 		for (const value of reference.values) {
// 			for (const coReference of preImage(getNodeTerm(value), state)) {
// 				const coSubjects = state.coproduct.getSubjects(ref, coReference, null)
// 				for (const coSubject of coSubjects) {
// 					if (state.components.get(coSubject.value) === subject.value) {
// 						const coObjects = state.coproduct.getObjects(coSubject, p, null)
// 						for (const coObject of coObjects) {
// 							const object = image<RDF.Quad_Object>(coObject, state)
// 							const id = toId(object)
// 							if (nullMatches.has(id)) {
// 								continue
// 							} else if (links.has(id)) {
// 								if (reference.order(value, links.get(id)!)) {
// 									links.set(id, value)
// 								}
// 							} else {
// 								const node = matchValueExpr(predicate, object, valueExpr, state)
// 								if (node === null) {
// 									nullMatches.add(id)
// 								} else {
// 									links.set(id, value)
// 									values.push(node)
// 								}
// 							}
// 						}
// 					}
// 				}
// 			}
// 		}
// 		tree.properties.set(predicate, {
// 			...getRange(min, max),
// 			order: (a: Node, b: Node) =>
// 				reference.order(
// 					links.get(toId(getNodeTerm(a)))!,
// 					links.get(toId(getNodeTerm(b)))!
// 				),
// 			values: values,
// 		})
// 	}
// 	return Object.freeze(tree)
// }
// export function image<T extends RDF.Term>(
// 	term: Exclude<T, RDF.BlankNode> | RDF.BlankNode,
// 	state: State
// ): T | RDF.BlankNode {
// 	if (term.termType === "BlankNode") {
// 		return DataFactory.blankNode(state.components.get(term.value))
// 	}
// 	return term
// }
// export function* preImage<T extends RDF.Term>(
// 	term: Exclude<T, RDF.BlankNode> | RDF.BlankNode,
// 	state: State
// ): Generator<T | RDF.BlankNode, void, undefined> {
// 	if (term.termType === "BlankNode") {
// 		for (const value of state.inverse.get(term.value)!) {
// 			yield DataFactory.blankNode(value)
// 		}
// 	} else {
// 		yield term
// 	}
// }
// export const getRange = (
// 	min: number | undefined,
// 	max: number | undefined
// ): { min: number; max: number } => ({
// 	min: min === undefined ? 1 : min,
// 	max: max === undefined ? 1 : max === -1 ? Infinity : max,
// })
// function matchLiteralType<C extends sortNumeric | sortTemporal | sortBoolean>(
// 	node: RDF.Term,
// 	tripleConstraint: baseTripleConstraint & C
// ): node is TypedLiteral<C["valueExpr"]["datatype"]> {
// 	return (
// 		node.termType === "Literal" &&
// 		tripleConstraint.valueExpr.datatype === node.datatype.value
// 	)
// }
// function* matchTypedTripleConstraint<
// 	C extends sortNumeric | sortTemporal | sortBoolean
// >(
// 	subject: RDF.Quad_Subject,
// 	tripleConstraint: baseTripleConstraint & C,
// 	state: State
// ): Generator<TypedLiteral<C["valueExpr"]["datatype"]>, void, undefined> {
// 	const predicate = DataFactory.namedNode(tripleConstraint.predicate)
// 	const objects = state.pushout.getObjects(subject, predicate, null)
// 	for (const object of objects) {
// 		if (matchLiteralType(object, tripleConstraint)) {
// 			if (nodeSatisfies(object, tripleConstraint.valueExpr)) {
// 				yield object
// 			}
// 		}
// 	}
// }
//# sourceMappingURL=match.js.map