import ShExCore from "@shexjs/core"
import ShExParser from "@shexjs/parser"

import { Buffer } from "ipfs-http-client"
import { TypeOf } from "io-ts/es6/index.js"

import { Schema } from "./schema.js"

const dwebURI = /^dweb:\/ipfs\/([a-z2-7]{59})$/
async function loadURI(
	uri: string,
	ipfs: Ipfs.CoreAPI
): Promise<ShExParser.Schema> {
	const parser = ShExParser.construct()
	const match = dwebURI.exec(uri)
	if (match !== null) {
		const chunks: Buffer[] = []
		for await (const chunk of ipfs.cat(match[1])) {
			chunks.push(Buffer.from(chunk))
		}

		const data = Buffer.concat(chunks)
		const shex = new TextDecoder().decode(data)
		return parser.parse(shex)
	}
	const shex = await fetch(uri).then((res) => res.text())
	return parser.parse(shex)
}

export async function loadSchema(
	uri: string,
	ipfs: Ipfs.CoreAPI
): Promise<ShExParser.Schema> {
	const schema = ShExCore.Util.emptySchema()
	const loaded: Set<string> = new Set([])
	async function load(uri: string) {
		loaded.add(uri)
		const s = await loadURI(uri, ipfs)
		if (Array.isArray(s.imports)) {
			await Promise.all(s.imports.filter((u) => !loaded.has(u)).map(load))
			delete s.imports
		}
		ShExCore.Util.merge(schema, s, false, true)
	}
	await load(uri)
	return schema
}

export async function loadReductionSchema(
	uri: string,
	ipfs: Ipfs.CoreAPI
): Promise<TypeOf<typeof Schema>> {
	const schema = await loadSchema(uri, ipfs)
	const result = Schema.decode(schema)
	if (result._tag === "Right") {
		return Promise.resolve(result.right)
	} else {
		return Promise.reject(result.left)
	}
}
