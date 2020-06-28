import { DataFactory } from "n3";
const rexKey = "http://underlay.org/ns/rex#key", rexWith = "http://underlay.org/ns/rex#with", rexMeta = "http://underlay.org/ns/rex#meta", rexSort = "http://underlay.org/ns/rex#sort", rexFirst = "http://underlay.org/ns/rex#first", rexLast = "http://underlay.org/ns/rex#last", rexGreatest = "http://underlay.org/ns/rex#greatest", rexLeast = "http://underlay.org/ns/rex#least", rexEarliest = "http://underlay.org/ns/rex#earliest", rexLatest = "http://underlay.org/ns/rex#latest", rexAll = "http://underlay.org/ns/rex#all", rexAny = "http://underlay.org/ns/rex#any";
export const defaultSort = rexFirst;
export const rex = {
    key: rexKey,
    with: rexWith,
    meta: rexMeta,
    sort: rexSort,
    first: rexFirst,
    last: rexLast,
    greatest: rexGreatest,
    least: rexLeast,
    earliest: rexEarliest,
    latest: rexLatest,
    all: rexAll,
    any: rexAny,
};
const xsdString = "http://www.w3.org/2001/XMLSchema#string", xsdDate = "http://www.w3.org/2001/XMLSchema#date", xsdDateTime = "http://www.w3.org/2001/XMLSchema#dateTime", xsdBoolean = "http://www.w3.org/2001/XMLSchema#boolean", xsdDecimal = "http://www.w3.org/2001/XMLSchema#decimal", xsdFloat = "http://www.w3.org/2001/XMLSchema#float", xsdDouble = "http://www.w3.org/2001/XMLSchema#double", xsdInteger = "http://www.w3.org/2001/XMLSchema#integer", xsdPositiveInteger = "http://www.w3.org/2001/XMLSchema#positiveInteger", xsdNonPositiveInteger = "http://www.w3.org/2001/XMLSchema#nonPositiveInteger", xsdNegativeInteger = "http://www.w3.org/2001/XMLSchema#negativeInteger", xsdNonNegativeInteger = "http://www.w3.org/2001/XMLSchema#nonNegativeInteger", xsdLong = "http://www.w3.org/2001/XMLSchema#long", xsdInt = "http://www.w3.org/2001/XMLSchema#int", xsdShort = "http://www.w3.org/2001/XMLSchema#short", xsdByte = "http://www.w3.org/2001/XMLSchema#byte", xsdUnsignedLong = "http://www.w3.org/2001/XMLSchema#unsignedLong", xsdUnsignedInt = "http://www.w3.org/2001/XMLSchema#unsignedInt", xsdUnsignedShort = "http://www.w3.org/2001/XMLSchema#unsignedShort", xsdUnsignedByte = "http://www.w3.org/2001/XMLSchema#unsignedByte";
export const xsd = {
    string: xsdString,
    date: xsdDate,
    dateTime: xsdDateTime,
    boolean: xsdBoolean,
    decimal: xsdDecimal,
    float: xsdFloat,
    double: xsdDouble,
    integer: xsdInteger,
    positiveInteger: xsdPositiveInteger,
    nonPositiveInteger: xsdNonPositiveInteger,
    negativeInteger: xsdNegativeInteger,
    nonNegativeInteger: xsdNonNegativeInteger,
    long: xsdLong,
    int: xsdInt,
    short: xsdShort,
    byte: xsdByte,
    unsignedLong: xsdUnsignedLong,
    unsignedInt: xsdUnsignedInt,
    unsignedShort: xsdUnsignedShort,
    unsignedByte: xsdUnsignedByte,
};
const rdfType = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type", rdfLangString = "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString";
export const rdfTypeNode = DataFactory.namedNode(rdfType);
export const rdf = {
    type: rdfType,
    langString: rdfLangString,
};
//# sourceMappingURL=vocab.js.map