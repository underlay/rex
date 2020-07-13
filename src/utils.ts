import RDF from "rdf-js"
import * as N3 from "n3"
import { State } from "./state"

const { Store, StreamParser, StreamWriter, DataFactory } = N3

export type NamedNode = {
	termType: "NamedNode"
	value: string
}

export type BlankNode = {
	termType: "BlankNode"
	value: string
}

export type Literal = {
	termType: "Literal"
	langauge: string
	datatype: NamedNode
}

export type DefaultGraph = {
	termType: "DefaultGraph"
	value: ""
}

export type Quad = {
	subject: NamedNode | BlankNode
	predicate: NamedNode
	object: NamedNode | BlankNode | Literal
	graph: NamedNode | BlankNode | DefaultGraph
}
;(window as any).N3 = N3

export const fromId = (N3 as any).termFromId as (id: string) => RDF.Term
export const toId = (N3 as any).termToId as (term: RDF.Term) => string

const options = {
	format: "application/n-quads",
	blankNodePrefix: "_:",
}

export const parseQuads = (input: string): Promise<RDF.Quad[]> =>
	new Promise((resolve, reject) => {
		const quads: RDF.Quad[] = []
		new StreamParser(options)
			.on("data", (quad) => quads.push(quad))
			.on("end", () => resolve(quads))
			.on("error", (err) => reject(err))
			.end(input)
	})

export const parseStore = (input: string): Promise<N3.Store> =>
	new Promise((resolve, reject) => {
		const store = new Store()
		new StreamParser(options)
			.on("data", (quad) => store.addQuad(quad))
			.on("end", () => resolve(store))
			.on("error", (err) => reject(err))
			.end(input)
	})

export const writeStore = (store: N3.Store): Promise<string> =>
	new Promise((resolve, reject) => {
		let s = ""
		const writer = new StreamWriter(options)
			.on("data", (chunk) => (s += chunk))
			.on("end", () => resolve(s))
			.on("error", (err) => reject(err))

		for (const quad of store.getQuads(null, null, null, null)) {
			// The writer.write typing is incorrect here, writer accepts object streams of quads
			writer.write((quad as unknown) as string)
		}
		writer.end()
	})

export function image<T extends RDF.Term>(
	term: Exclude<T, RDF.BlankNode> | RDF.BlankNode,
	state: State
): T | RDF.BlankNode {
	if (term.termType === "BlankNode") {
		const value = state.components.get(term.value)
		if (value !== undefined) {
			return DataFactory.blankNode(value)
		}
	}
	return term
}

export function* preImage<T extends RDF.Term>(
	term: Exclude<T, RDF.BlankNode> | RDF.BlankNode,
	state: State
): Generator<T | RDF.BlankNode, void, undefined> {
	if (term.termType === "BlankNode") {
		for (const value of state.inverse.get(term.value)!) {
			yield DataFactory.blankNode(value)
		}
	} else {
		yield term
	}
}

export const getRange = (
	min: number | undefined,
	max: number | undefined
): { min: number; max: number } => ({
	min: min === undefined ? 1 : min,
	max: max === undefined ? 1 : max === -1 ? Infinity : max,
})
