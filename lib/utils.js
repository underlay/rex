import * as N3 from "n3";
import jsonld from "jsonld";
const { Store, StreamParser, StreamWriter, DataFactory } = N3;
export const { fromId, toId } = DataFactory.internal;
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
        // The writer.write typing is incorrect here, writer accetps object streams of quads
        writer.write(quad);
    }
    writer.end();
});
export const parseJsonLd = (input, documentLoader) => {
    const options = {};
    if (documentLoader !== null) {
        options.documentLoader = documentLoader;
    }
    return jsonld.toRDF(input, options).then((result) => {
        for (const quad of result) {
            if (quad.subject.value.startsWith("_:")) {
                quad.subject.value = quad.subject.value.slice(2);
            }
            if (quad.object.value.startsWith("_:")) {
                quad.object.value = quad.object.value.slice(2);
            }
            if (quad.graph.value.startsWith("_:")) {
                quad.graph.value = quad.graph.value.slice(2);
            }
        }
        return result;
    });
};
//# sourceMappingURL=utils.js.map