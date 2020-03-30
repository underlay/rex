import { N3Store, Store, StreamParser, StreamWriter } from "n3"

const options = {
	format: "application/n-quads",
	blankNodePrefix: "_:"
}

export const parseQuads = (quads: string): Promise<N3Store> =>
	new Promise((resolve, reject) => {
		const store = new Store()
		new StreamParser(options)
			.on("data", quad => store.addQuad(quad))
			.on("end", () => resolve(store))
			.on("error", err => reject(err))
			.end(quads)
	})

export const writeQuads = (store: N3Store): Promise<string> =>
	new Promise((resolve, reject) => {
		let s = ""
		const writer = new StreamWriter(options)
			.on("data", chunk => (s += chunk))
			.on("end", () => resolve(s))
			.on("error", err => reject(err))

		store.forEach(
			quad => writer.write((quad as unknown) as string),
			null,
			null,
			null,
			null
		)
		writer.end()
	})
