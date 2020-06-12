import RDF from "rdf-js"
import * as N3 from "n3"

const { Store, StreamParser, StreamWriter, DataFactory } = N3

export const { fromId, toId } = (DataFactory as any).internal as {
	fromId: (id: string) => RDF.Term
	toId: (term: RDF.Term) => string
}

export const rdfType = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"

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
			// The writer.write typing is incorrect here, writer accetps object streams of quads
			writer.write((quad as unknown) as string)
		}
		writer.end()
	})
