import RDF from "rdf-js"
import * as N3 from "n3"

import jsonld, { Options } from "jsonld"
import { RemoteDocument } from "jsonld/jsonld-spec"

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

export const { fromId, toId } = (DataFactory as any).internal as {
	fromId: (id: string) => RDF.Term
	toId: (term: RDF.Term) => string
}

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

export const parseStore = (input: string): Promise<N3.N3Store> =>
	new Promise((resolve, reject) => {
		const store = new Store()
		new StreamParser(options)
			.on("data", (quad) => store.addQuad(quad))
			.on("end", () => resolve(store))
			.on("error", (err) => reject(err))
			.end(input)
	})

export const writeStore = (store: N3.N3Store): Promise<string> =>
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

export const parseJsonLd = (
	input: {},
	documentLoader?: (url: string) => Promise<RemoteDocument>
): Promise<RDF.Quad[]> => {
	const options: Options.ToRdf = {}
	if (documentLoader !== null) {
		options.documentLoader = documentLoader
	}

	return jsonld.toRDF(input, options).then((result) => {
		for (const quad of result as RDF.Quad[]) {
			if (quad.subject.value.startsWith("_:")) {
				quad.subject.value = quad.subject.value.slice(2)
			}
			if (quad.object.value.startsWith("_:")) {
				quad.object.value = quad.object.value.slice(2)
			}
			if (quad.graph.value.startsWith("_:")) {
				quad.graph.value = quad.graph.value.slice(2)
			}
		}
		return result as RDF.Quad[]
	})
}
