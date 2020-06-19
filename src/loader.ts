import ShExCore from "@shexjs/core"
import ShExParser from "@shexjs/parser"

const dwebURI = /^dweb:\/ipfs\/([a-z2-7]{59})$/
async function resolveURI(
	uri: string,
	ipfs: Ipfs.CoreAPI | null = null
): Promise<ShExParser.Schema> {
	const parser = ShExParser.construct()
	const match = dwebURI.exec(uri)
	if (match !== null && ipfs !== null) {
		let shex = ""
		for await (const chunk of ipfs.cat(match[1])) {
			shex += chunk.toString()
		}
		return parser.parse(shex)
	}
	const shex = await fetch(uri).then((res) => res.text())
	return parser.parse(shex)
}

export async function loadURI(
	uri: string,
	ipfs: Ipfs.CoreAPI | null = null
): Promise<ShExParser.Schema> {
	const merged = ShExCore.Util.emptySchema()
	const loaded: Set<string> = new Set([])
	async function load(uri: string) {
		loaded.add(uri)
		const schema = await resolveURI(uri, ipfs)
		if (Array.isArray(schema.imports)) {
			await Promise.all(schema.imports.filter((u) => !loaded.has(u)).map(load))
			delete schema.imports
		}
		ShExCore.Util.merge(merged, schema, false, true)
	}
	await load(uri)
	return merged
}

export async function loadText(
	shex: string,
	ipfs: Ipfs.CoreAPI | null = null
): Promise<ShExParser.Schema> {
	const merged = ShExCore.Util.emptySchema()
	const loaded: Set<string> = new Set([])
	async function load(schema: ShExParser.Schema) {
		ShExCore.Util.merge(merged, schema, false, true)
		if (Array.isArray(schema.imports)) {
			await Promise.all(
				schema.imports
					.filter((uri) => !loaded.has(uri))
					.map((schema) => resolveURI(schema, ipfs).then(load))
			)
			delete schema.imports
		}
	}
	await load(ShExParser.construct().parse(shex))
	return merged
}
