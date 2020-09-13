import { BlankNode, fromId as _fromId, toId as _toId } from "n3.ts";
export const fromId = _fromId;
export const toId = _toId;
// const options = {
// 	format: "application/n-quads",
// 	blankNodePrefix: "_:",
// }
// export const parseQuads = (input: string): Promise<RDF.Quad[]> =>
// 	new Promise((resolve, reject) => {
// 		const quads: RDF.Quad[] = []
// 		new StreamParser(options)
// 			.on("data", (quad) => quads.push(quad))
// 			.on("end", () => resolve(quads))
// 			.on("error", (err) => reject(err))
// 			.end(input)
// 	})
// export const parseStore = (input: string): Promise<N3.Store> =>
// 	new Promise((resolve, reject) => {
// 		const store = new Store()
// 		new StreamParser(options)
// 			.on("data", (quad) => store.addQuad(quad))
// 			.on("end", () => resolve(store))
// 			.on("error", (err) => reject(err))
// 			.end(input)
// 	})
// export const writeStore = (store: N3.Store): Promise<string> =>
// 	new Promise((resolve, reject) => {
// 		let s = ""
// 		const writer = new StreamWriter(options)
// 			.on("data", (chunk) => (s += chunk))
// 			.on("end", () => resolve(s))
// 			.on("error", (err) => reject(err))
// 		for (const quad of store.getQuads(null, null, null, null)) {
// 			// The writer.write typing is incorrect here, writer accepts object streams of quads
// 			writer.write((quad as unknown) as string)
// 		}
// 		writer.end()
// 	})
export function image(term, state) {
    if (term.termType === "BlankNode") {
        const value = state.components.get(term.value);
        if (value !== undefined) {
            return new BlankNode(value);
        }
    }
    return term;
}
export function* preImage(term, state) {
    if (term.termType === "BlankNode") {
        for (const value of state.inverse.get(term.value)) {
            yield new BlankNode(value);
        }
    }
    else {
        yield term;
    }
}
export const getRange = (min, max) => ({
    min: min === undefined ? 1 : min,
    max: max === undefined ? 1 : max === -1 ? Infinity : max,
});
//# sourceMappingURL=utils.js.map