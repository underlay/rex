import { loadText } from "../lib/loader.js"
import { materialize } from "../lib/materialize.js"
import { Schema } from "../lib/schema.js"

self.addEventListener("message", ({ data: { id, shex, assertions } }) => {
	loadText(shex, null)
		.then((schema) => {
			const result = Schema.decode(schema)
			if (result._tag === "Left") {
				throw JSON.stringify(result.left, null, "  ")
			}
			const view = materialize(result.right, assertions)
			for (let i = 0; i < view.length; i++) {
				view[i] = view[i].toJSON()
			}
			postMessage({ id, result: view })
		})
		.catch((err) => postMessage({ id, error: err.toString() }))
})
