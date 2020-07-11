import jsonld from "jsonld"
import { canonize } from "rdf-canonize"
import raw from "ipld-raw"
import { Buffer } from "buffer"

export async function parseJsonLd(input, documentLoader = null) {
	const options = {}
	if (documentLoader !== null) {
		options.documentLoader = documentLoader
	}

	const dataset = await jsonld.toRDF(input, options)
	const canonized = await canonize(dataset, {
		algorithm: "URDNA2015",
		format: "application/n-quads",
	})

	const cid = await raw.util.cid(Buffer.from(canonized))

	for (const quad of dataset) {
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
	return { dataset, cid: cid.toString() }
}
