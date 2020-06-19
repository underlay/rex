import { DataFactory } from "n3";
export const xsdDateTime = "http://www.w3.org/2001/XMLSchema#dateTime";
export const xsdDate = "http://www.w3.org/2001/XMLSchema#date";
export const xsdBoolean = "http://www.w3.org/2001/XMLSchema#boolean";
export const rdfType = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
export const rdfTypeNode = DataFactory.namedNode(rdfType);
const rexKey = "http://underlay.org/ns/rex#key";
const rexSort = "http://underlay.org/ns/rex#sort";
const rexAscending = "http://underlay.org/ns/rex#ascending";
const rexDescending = "http://underlay.org/ns/rex#descending";
const rexGreater = "http://underlay.org/ns/rex#greater";
const rexLesser = "http://underlay.org/ns/rex#lesser";
const rexEarlier = "http://underlay.org/ns/rex#earlier";
const rexLater = "http://underlay.org/ns/rex#later";
const rexAnd = "http://underlay.org/ns/rex#and";
const rexOr = "http://underlay.org/ns/rex#or";
const rexWith = "http://underlay.org/ns/rex#with";
const rexMeta = "http://underlay.org/ns/rex#meta";
export const defaultSort = rexAscending;
export const rex = {
    key: rexKey,
    sort: rexSort,
    ascending: rexAscending,
    descending: rexDescending,
    greater: rexGreater,
    lesser: rexLesser,
    earlier: rexEarlier,
    later: rexLater,
    and: rexAnd,
    or: rexOr,
};
//# sourceMappingURL=vocab.js.map