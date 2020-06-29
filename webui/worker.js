import { loadText } from "../lib/loader.js"
import { materialize } from "../lib/materialize.js"
import { Schema } from "../lib/schema.js"
import { right, left } from "fp-ts/es6/Either.js"

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
			postMessage({ id, result: right(view) })
		})
		.catch((err) => postMessage({ id, result: left(err.toString()) }))
})
