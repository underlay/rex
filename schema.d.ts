type Schema = {
	"@context"?: "http://www.w3.org/ns/shex.jsonld"
	type: "Schema"
	startActs?: SemAct[]
	start?: shapeExpr
	shapes?: ({ id: string } & shapeExprObject)[]
}

type shapeExpr = shapeExprObject | shapeExprRef

type shapeExprObject =
	| ShapeOr
	| ShapeAnd
	| ShapeNot
	| NodeConstraint
	| Shape
	| ShapeExternal

type ShapeOr = { type: "ShapeOr"; shapeExprs: shapeExpr[] }
type ShapeAnd = {
	type: "ShapeAnd"
	id?: shapeExprLabel
	shapeExprs: shapeExpr[]
}
type ShapeNot = { type: "ShapeNot"; shapeExpr: shapeExpr }
type ShapeExternal = { type: "ShapeExternal" }
type shapeExprRef = shapeExprLabel
type shapeExprLabel = string

type NodeConstraint = {
	type: "NodeConstraint"
	nodeKind?: "iri" | "bnode" | "nonliteral" | "literal"
	datatype?: string
	// xsFacet*
	values?: valueSetValue[]
}

// xsFacet 	=	stringFacet | numericFacet ;
// stringFacet 	=	(length|minlength|maxlength):INTEGER | pattern:STRING flags:STRING? ;
// numericFacet 	=	(mininclusive|minexclusive|maxinclusive|maxexclusive):numericLiteral
// 	|	(totaldigits|fractiondigits):INTEGER ;

type numericLiteral = number
type valueSetValue =
	| objectValue
	| IriStem
	| IriStemRange
	| LiteralStem
	| LiteralStemRange
	| Language
	| LanguageStem
	| LanguageStemRange
type objectValue = string | ObjectLiteral

type ObjectLiteral = { value: string; language?: string; type?: string }

type IriStem = { type: "IriStem"; stem: string }

type IriStemRange = {
	type: "IriStemRange"
	stem: string | Wildcard
	exclusions: (string | IriStem)[]
}

type LiteralStem = { type: "LiteralStem"; stem: string }
type LiteralStemRange = {
	type: "LiteralStemRange"
	stem: string | Wildcard
	exclusions: (string | LiteralStem)[]
}

type Language = { type: "Language"; languageTag: string }
type LanguageStem = { type: "LanguageStem"; stem: string }
type LanguageStemRange = {
	type: "LanguageStemRange"
	stem: string | Wildcard
	exclusions: (string | LanguageStem)[]
}

type Wildcard = { type: "Wildcard" }

type Shape = {
	type: "Shape"
	closed?: boolean
	extra?: string[]
	expression?: tripleExpr
	semActs?: SemAct[]
	annotations?: Annotation[]
}
type tripleExpr = tripleExprObject | tripleExprRef
type tripleExprObject = EachOf | OneOf | TripleConstraint

type EachOf = {
	type: "EachOf"
	id?: tripleExprLabel
	expressions: tripleExpr[]
	min?: number
	max?: number
	semActs?: SemAct[]
	annotations?: Annotation[]
}

type OneOf = {
	type: "OneOf"
	id?: tripleExprLabel
	expressions: tripleExpr[]
	min?: number
	max?: number
	semActs?: SemAct[]
	annotations?: Annotation[]
}

type TripleConstraint = {
	type: "TripleConstraint"
	id?: tripleExprLabel
	inverse?: boolean
	predicate: string
	valueExpr?: shapeExpr
	min?: number
	max?: number
	semActs?: SemAct[]
	annotations?: Annotation[]
}

type tripleExprRef = tripleExprLabel
type tripleExprLabel = string

type SemAct = { type: "SemAct"; name: string; code?: string }
type Annotation = { type: "Annotation"; predicate: string; object: objectValue }
