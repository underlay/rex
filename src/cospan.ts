import RDF from "rdf-js"
import * as N3 from "n3"

import { toId, rdfType } from "./utils.js"
import { shapeExpr } from "./schema.js"

const { Store, DataFactory } = N3

const RDFType = DataFactory.namedNode(rdfType)

export function cospan(
	types: Map<string, { type: string; shapeExpr: shapeExpr; key?: string }>,
	datasets: RDF.Quad[][]
): {
	coproduct: N3.N3Store
	components: Map<string, string>
	inverse: Map<string, Set<string>>
	pushout: N3.N3Store
} {
	const coproduct = new Store()
	for (const [i, dataset] of datasets.entries()) {
		for (const quad of dataset) {
			if (quad.subject.termType === "BlankNode") {
				const value = `d${i}-${quad.subject.value}`
				quad.subject = DataFactory.blankNode(value) as RDF.Quad_Subject
			}
			if (quad.object.termType === "BlankNode") {
				const value = `d${i}-${quad.object.value}`
				quad.object = DataFactory.blankNode(value) as RDF.Quad_Object
			}
			if (quad.graph.termType === "BlankNode") {
				const value = `d${i}-${quad.graph.value}`
				quad.graph = DataFactory.blankNode(value) as RDF.Quad_Graph
			} else if (quad.graph.termType === "DefaultGraph") {
				quad.graph = DataFactory.blankNode(`d${i}`) as RDF.Quad_Graph
			}
		}
		coproduct.addQuads(dataset)
	}

	const classes: Map<string, Set<string>> = new Map()
	const partitions: Set<Set<string>> = new Set()
	for (const { type, key } of types.values()) {
		const object = DataFactory.namedNode(type)
		const subjects = coproduct.getSubjects(RDFType, object, null)
		if (key !== undefined) {
			const pushouts: Map<string, Set<string>> = new Map()
			for (const subject of subjects) {
				if (subject.termType === "BlankNode") {
					const subjectId = subject.value
					const predicate = DataFactory.namedNode(key)
					for (const object of coproduct.getObjects(subject, predicate, null)) {
						const id: string = toId(object)
						const pushout = pushouts.get(id)
						if (pushout) {
							pushout.add(subjectId)
						} else {
							pushouts.set(id, new Set([subjectId]))
						}
					}
				}
			}

			for (const subjects of pushouts.values()) {
				const merge: Set<Set<string>> = new Set()
				for (const subject of subjects) {
					if (classes.has(subject)) {
						merge.add(classes.get(subject)!)
					} else {
						merge.add(subjects)
						partitions.add(subjects)
						classes.set(subject, subjects)
					}
				}
				if (merge.size > 1) {
					const union: Set<string> = new Set()
					partitions.add(union)
					for (const set of merge) {
						partitions.delete(set)
						for (const subject of set) {
							union.add(subject)
						}
					}
					for (const subject of union) {
						classes.set(subject, union)
					}
				}
			}
		} else {
			for (const { value, termType } of subjects) {
				if (termType === "BlankNode") {
					const partition = new Set([value])
					partitions.add(partition)
					classes.set(value, partition)
				}
			}
		}
	}

	const names: Map<Set<string>, string> = new Map()
	const components: Map<string, string> = new Map()
	const inverse: Map<string, Set<string>> = new Map()

	let n = 0
	for (const partition of partitions) {
		const name = `p-${n++}`
		names.set(partition, name)
		inverse.set(name, partition)
		for (const b of partition) {
			components.set(b, name)
		}
	}

	const pushout = new Store()
	for (const dataset of datasets) {
		for (const quad of dataset) {
			if (quad.subject.termType === "BlankNode") {
				if (components.has(quad.subject.value)) {
					const v = components.get(quad.subject.value)!
					quad.subject = DataFactory.blankNode(v)
				}
			}
			if (quad.object.termType === "BlankNode") {
				if (components.has(quad.object.value)) {
					quad.object = DataFactory.blankNode(
						components.get(quad.object.value)!
					)
				}
			}
			if (quad.graph.termType === "BlankNode") {
				if (components.has(quad.graph.value)) {
					quad.graph = DataFactory.blankNode(components.get(quad.graph.value)!)
				}
			}
		}
		pushout.addQuads(dataset)
	}

	return { coproduct, components, inverse, pushout }
}
