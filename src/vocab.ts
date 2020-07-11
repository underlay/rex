import { DataFactory } from "n3"

const rexIn = "http://underlay.org/ns/rex#in",
	rexKey = "http://underlay.org/ns/rex#key",
	rexWith = "http://underlay.org/ns/rex#with",
	rexMeta = "http://underlay.org/ns/rex#meta",
	rexSort = "http://underlay.org/ns/rex#sort",
	rexFirst = "http://underlay.org/ns/rex#first",
	rexLast = "http://underlay.org/ns/rex#last",
	rexGreatest = "http://underlay.org/ns/rex#greatest",
	rexLeast = "http://underlay.org/ns/rex#least",
	rexEarliest = "http://underlay.org/ns/rex#earliest",
	rexLatest = "http://underlay.org/ns/rex#latest",
	rexAll = "http://underlay.org/ns/rex#all",
	rexAny = "http://underlay.org/ns/rex#any"

export const defaultSort = rexFirst

export type Sort =
	| typeof rexFirst
	| typeof rexLast
	| typeof rexGreatest
	| typeof rexLeast
	| typeof rexEarliest
	| typeof rexLatest
	| typeof rexAll
	| typeof rexAny

export const rex = {
	in: rexIn as typeof rexIn,
	key: rexKey as typeof rexKey,
	with: rexWith as typeof rexWith,
	meta: rexMeta as typeof rexMeta,
	sort: rexSort as typeof rexSort,
	first: rexFirst as typeof rexFirst,
	last: rexLast as typeof rexLast,
	greatest: rexGreatest as typeof rexGreatest,
	least: rexLeast as typeof rexLeast,
	earliest: rexEarliest as typeof rexEarliest,
	latest: rexLatest as typeof rexLatest,
	all: rexAll as typeof rexAll,
	any: rexAny as typeof rexAny,
}

const xsdString = "http://www.w3.org/2001/XMLSchema#string",
	xsdDate = "http://www.w3.org/2001/XMLSchema#date",
	xsdDateTime = "http://www.w3.org/2001/XMLSchema#dateTime",
	xsdBoolean = "http://www.w3.org/2001/XMLSchema#boolean",
	xsdDecimal = "http://www.w3.org/2001/XMLSchema#decimal",
	xsdFloat = "http://www.w3.org/2001/XMLSchema#float",
	xsdDouble = "http://www.w3.org/2001/XMLSchema#double",
	xsdInteger = "http://www.w3.org/2001/XMLSchema#integer",
	xsdPositiveInteger = "http://www.w3.org/2001/XMLSchema#positiveInteger",
	xsdNonPositiveInteger = "http://www.w3.org/2001/XMLSchema#nonPositiveInteger",
	xsdNegativeInteger = "http://www.w3.org/2001/XMLSchema#negativeInteger",
	xsdNonNegativeInteger = "http://www.w3.org/2001/XMLSchema#nonNegativeInteger",
	xsdLong = "http://www.w3.org/2001/XMLSchema#long",
	xsdInt = "http://www.w3.org/2001/XMLSchema#int",
	xsdShort = "http://www.w3.org/2001/XMLSchema#short",
	xsdByte = "http://www.w3.org/2001/XMLSchema#byte",
	xsdUnsignedLong = "http://www.w3.org/2001/XMLSchema#unsignedLong",
	xsdUnsignedInt = "http://www.w3.org/2001/XMLSchema#unsignedInt",
	xsdUnsignedShort = "http://www.w3.org/2001/XMLSchema#unsignedShort",
	xsdUnsignedByte = "http://www.w3.org/2001/XMLSchema#unsignedByte"

export const xsd = {
	string: xsdString as typeof xsdString,
	date: xsdDate as typeof xsdDate,
	dateTime: xsdDateTime as typeof xsdDateTime,
	boolean: xsdBoolean as typeof xsdBoolean,
	decimal: xsdDecimal as typeof xsdDecimal,
	float: xsdFloat as typeof xsdFloat,
	double: xsdDouble as typeof xsdDouble,
	integer: xsdInteger as typeof xsdInteger,
	positiveInteger: xsdPositiveInteger as typeof xsdPositiveInteger,
	nonPositiveInteger: xsdNonPositiveInteger as typeof xsdNonPositiveInteger,
	negativeInteger: xsdNegativeInteger as typeof xsdNegativeInteger,
	nonNegativeInteger: xsdNonNegativeInteger as typeof xsdNonNegativeInteger,
	long: xsdLong as typeof xsdLong,
	int: xsdInt as typeof xsdInt,
	short: xsdShort as typeof xsdShort,
	byte: xsdByte as typeof xsdByte,
	unsignedLong: xsdUnsignedLong as typeof xsdUnsignedLong,
	unsignedInt: xsdUnsignedInt as typeof xsdUnsignedInt,
	unsignedShort: xsdUnsignedShort as typeof xsdUnsignedShort,
	unsignedByte: xsdUnsignedByte as typeof xsdUnsignedByte,
}

const rdfType = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
	rdfLangString = "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString"

export const rdfTypeNode = DataFactory.namedNode(rdfType)

export const rdf = {
	type: rdfType as typeof rdfType,
	langString: rdfLangString as typeof rdfLangString,
}
