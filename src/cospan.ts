import RDF from "rdf-js"
import { Store, DataFactory } from "n3"

import { toId } from "./utils.js"
import { Schema } from "./schema.js"
import { rdfTypeNode } from "./vocab.js"
import { TypeOf } from "io-ts/es6/index.js"

const wrap = <T extends RDF.Term>(term: T, i: number): T | RDF.BlankNode =>
	term.termType === "BlankNode"
		? DataFactory.blankNode(`d${i}-${term.value}`)
		: term.termType === "DefaultGraph"
		? DataFactory.blankNode(`d${i}`)
		: term

export function cospan(
	types: Map<
		string,
		{
			type: string
			shapeExpr: TypeOf<typeof Schema>["shapes"][0]
			key?: string
		}
	>,
	datasets: RDF.Quad[][]
): {
	coproduct: Store
	components: Map<string, string>
	inverse: Map<string, Set<string>>
	pushout: Store
} {
	const coproduct = new Store()
	for (const [i, store] of datasets.entries()) {
		for (const q of store) {
			coproduct.addQuad(
				wrap(q.subject, i),
				q.predicate,
				wrap(q.object, i),
				wrap(q.graph, i)
			)
		}
	}

	const classes: Map<string, Set<string>> = new Map()
	const partitions: Set<Set<string>> = new Set()
	for (const { type, key } of types.values()) {
		const object = DataFactory.namedNode(type)
		const subjects = coproduct.getSubjects(rdfTypeNode, object, null)
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
	for (const quad of coproduct.getQuads(null, null, null, null)) {
		const q = { ...quad }
		if (q.subject.termType === "BlankNode" && components.has(q.subject.value)) {
			q.subject = DataFactory.blankNode(components.get(q.subject.value))
		}
		if (q.object.termType === "BlankNode" && components.has(q.object.value)) {
			q.object = DataFactory.blankNode(components.get(q.object.value))
		}
		if (q.graph.termType === "BlankNode" && components.has(q.graph.value)) {
			q.graph = DataFactory.blankNode(components.get(q.graph.value))
		}
		pushout.addQuad(q.subject, q.predicate, q.object, q.graph)
	}

	return { coproduct, components, inverse, pushout }
}
