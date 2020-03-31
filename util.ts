import {
	N3Store,
	StreamParser,
	StreamWriter,
	Quad_Object,
	DataFactory,
	Term
} from "n3"
import { Store } from "n3"
import ShExCore from "@shex/core"
;(window as any).ShExCore = ShExCore

const prefix = "http://github.com/underlay/rex#"
const names = ["replace", "fill", "left", "right"]

export const rex: { [name: string]: string } = {}
names.map((name: string) => (rex[name] = prefix + name))

export const defaults: Map<string, string> = new Map([[rex.fill, rex.right]])

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

		for (const quad of store.getQuads(null, null, null, null)) {
			// The writer.write typing is incorrect here, writer accetps object streams of quads
			writer.write((quad as unknown) as string)
		}
		writer.end()
	})

export function compareObjectValue(a: objectValue, b: objectValue): boolean {
	if (typeof a === "string" || typeof b === "string") {
		return a === b
	} else {
		return a.value === b.value && a.type === b.type && a.language === b.language
	}
}

export function parseObjectValue(node: objectValue): Quad_Object {
	if (typeof node === "string") {
		return fromId(node) as Quad_Object
	} else if (node.language) {
		return DataFactory.literal(node.value, node.language)
	} else if (node.type) {
		return DataFactory.literal(node.value, DataFactory.namedNode(node.type))
	} else {
		return DataFactory.literal(node.value)
	}
}

export function fromId(id: string): Term {
	return (DataFactory as any).internal.fromId(id)
}

export function objectValueUnion<T>(tests: ShExCore.TestedTriple<T>[][]) {
	const union: ShExCore.TestedTriple<T>[] = []
	for (const test of tests) {
		for (const t of test) {
			if (!union.some(({ object }) => compareObjectValue(t.object, object))) {
				union.push(t)
			}
		}
	}
	return union
}

const inVocab = (id: string) =>
	id.indexOf(prefix) === 0 && rex.hasOwnProperty(id.slice(prefix.length))

export function parseAnnotations(
	expression: tripleExprObject
): Map<string, string> {
	const annotations: Map<string, string> = new Map()
	console.log("annotations", expression.annotations)
	for (const { predicate, object } of expression.annotations || []) {
		if (typeof object === "string" && inVocab(predicate) && inVocab(object)) {
			annotations.set(predicate, object)
		}
	}
	return annotations
}

export function getTripleExprObject(
	tripleExpr: tripleExpr,
	index: ShExCore.Index
): tripleExprObject {
	if (typeof tripleExpr === "string") {
		return index.tripleExprs[tripleExpr]
	} else {
		return tripleExpr
	}
}

export function getShapeExprObject(
	shapeExpr: shapeExpr,
	index: ShExCore.Index
): shapeExprObject {
	if (typeof shapeExpr === "string") {
		return index.shapeExprs[shapeExpr]
	} else {
		return shapeExpr
	}
}
