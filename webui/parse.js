import jsonld from "jsonld"

export function parseJsonLd(input, documentLoader = null) {
	const options = {}
	if (documentLoader !== null) {
		options.documentLoader = documentLoader
	}

	return jsonld.toRDF(input, options).then((result) => {
		for (const quad of result) {
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
		return result
	})
}
