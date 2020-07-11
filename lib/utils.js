import * as N3 from "n3";
const { Store, StreamParser, StreamWriter, DataFactory } = N3;
window.N3 = N3;
export const fromId = N3.termFromId;
export const toId = N3.termToId;
// export const { fromId, toId } = (DataFactory as any).internal as {
// 	fromId: (id: string) => RDF.Term
// 	toId: (term: RDF.Term) => string
// }
const options = {
    format: "application/n-quads",
    blankNodePrefix: "_:",
};
export const parseQuads = (input) => new Promise((resolve, reject) => {
    const quads = [];
    new StreamParser(options)
        .on("data", (quad) => quads.push(quad))
        .on("end", () => resolve(quads))
        .on("error", (err) => reject(err))
        .end(input);
});
export const parseStore = (input) => new Promise((resolve, reject) => {
    const store = new Store();
    new StreamParser(options)
        .on("data", (quad) => store.addQuad(quad))
        .on("end", () => resolve(store))
        .on("error", (err) => reject(err))
        .end(input);
});
export const writeStore = (store) => new Promise((resolve, reject) => {
    let s = "";
    const writer = new StreamWriter(options)
        .on("data", (chunk) => (s += chunk))
        .on("end", () => resolve(s))
        .on("error", (err) => reject(err));
    for (const quad of store.getQuads(null, null, null, null)) {
        // The writer.write typing is incorrect here, writer accepts object streams of quads
        writer.write(quad);
    }
    writer.end();
});
export function image(term, state) {
    if (term.termType === "BlankNode") {
        const value = state.components.get(term.value);
        if (value !== undefined) {
            return DataFactory.blankNode(value);
        }
    }
    return term;
}
export function* preImage(term, state) {
    if (term.termType === "BlankNode") {
        for (const value of state.inverse.get(term.value)) {
            yield DataFactory.blankNode(value);
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