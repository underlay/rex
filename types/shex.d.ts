declare module "@shexjs/parser" {
	function construct(): Parser

	class Parser {
		parse(shex: string): Schema
	}

	type Schema = {
		"@context"?: "http://www.w3.org/ns/shex.jsonld"
		type: "Schema"
		startActs?: SemAct[]
		start?: shapeExpr
		shapes?: ({ id: string } & shapeExprObject)[]
		imports?: string[]
	}

	type shapeExpr = shapeExprObject | string
	type shapeExprObject =
		| ShapeOr
		| ShapeAnd
		| ShapeNot
		| NodeConstraint
		| Shape
		| ShapeExternal

	type ShapeOr = { type: "ShapeOr"; shapeExprs: shapeExpr[] }
	type ShapeAnd = { type: "ShapeAnd"; shapeExprs: shapeExpr[] }
	type ShapeNot = { type: "ShapeNot"; shapeExpr: shapeExpr }
	type ShapeExternal = { type: "ShapeExternal" }

	type NodeConstraint = { type: "NodeConstraint" } & (
		| nonLiteralNodeConstraint
		| literalNodeConstraint
	)

	type nonLiteralNodeConstraint =
		| ({ nodeKind?: "iri" } & stringFacets)
		| { nodeKind: "bnode" | "nonliteral" }

	type literalNodeConstraint =
		| ({ nodeKind: "literal" } & xsFacets)
		| ({ dataType: string } & xsFacets)
		| { values: valueSetValue[] & xsFacets }
		| numericFacets

	type stringLength =
		| { length: number }
		| { minlength?: number; maxlength?: number } // This doubles as an empty string facet

	type stringFacets = stringLength & { pattern: string; flags?: string }

	type numericFacets = {
		mininclusive?: number
		minexclusive?: number
		maxinclusive?: number
		maxexclusive?: number
		totaldigits?: number
		fractiondigits?: number
	}

	type xsFacets = stringFacets & numericFacets

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

	type tripleExpr = tripleExprObject | string
	type tripleExprObject = EachOf | OneOf | TripleConstraint

	type EachOf = {
		type: "EachOf"
		id?: string
		expressions: tripleExpr[]
		min?: number
		max?: number
		semActs?: SemAct[]
		annotations?: Annotation[]
	}

	type OneOf = {
		type: "OneOf"
		id?: string
		expressions: tripleExpr[]
		min?: number
		max?: number
		semActs?: SemAct[]
		annotations?: Annotation[]
	}

	type TripleConstraint = {
		type: "TripleConstraint"
		id?: string
		inverse?: boolean
		predicate: string
		valueExpr?: shapeExpr
		min?: number
		max?: number
		semActs?: SemAct[]
		annotations?: Annotation[]
	}

	type SemAct = { type: "SemAct"; name: string; code?: string }
	type Annotation<P = string, O = objectValue> = {
		type: "Annotation"
		predicate: P
		object: O
	}
}

declare module "@shexjs/core" {
	import * as RDF from "rdf-js"
	import {
		Schema,
		tripleExprObject,
		shapeExprObject,
		shapeExpr,
		objectValue,
		Annotation,
	} from "@shexjs/parser"

	interface DB {
		getQuads(
			subject: RDF.Term | string | null,
			predicate: RDF.Term | string | null,
			object: RDF.Term | string | null,
			graph: RDF.Term | string | null
		): RDF.Quad[]
		getSubjects(
			predicate: RDF.Term | string | null,
			object: RDF.Term | string | null,
			graph: RDF.Term | string | null
		): RDF.Quad_Subject[]
		getPredicates(
			subject: RDF.Term | string | null,
			object: RDF.Term | string | null,
			graph: RDF.Term | string | null
		): RDF.Quad_Predicate[]
		getObjects(
			subject: RDF.Term | string | null,
			predicate: RDF.Term | string | null,
			graph: RDF.Term | string | null
		): RDF.Quad_Object[]
		getGraphs(
			subject: RDF.Term | string | null,
			predicate: RDF.Term | string | null,
			object: RDF.Term | string | null
		): RDF.Quad_Graph[]
		size: number
	}

	type Start = { term: "START" }
	type Index = {
		tripleExprs: { [id: string]: tripleExprObject }
		shapeExprs: { [id: string]: shapeExprObject }
	}

	interface N3DB extends DB {}
	const Util: {
		makeN3DB(store: DB): N3DB
		index(schema: Schema): Index
		emptySchema(): Schema
		merge(
			left: Schema,
			right: Schema,
			overwrite: boolean,
			inPlace: boolean
		): void
	}

	class Validator {
		static start: Start
		static construct(
			schema: Schema,
			options?: { or?: string; partition?: string; results?: string }
		): Validator
		validate(
			db: DB,
			id: string,
			start: shapeExpr
		): SuccessResult | FailureResult
		validate(db: DB, point: string, shape: string | Start): ShapeTestT | Failure // ???
	}

	type SuccessResult =
		| ShapeAndResults
		| ShapeOrResults
		| ShapeNotResults
		| ShapeTestT
		| NodeTest

	type FailureResult =
		| ShapeAndFailure
		| ShapeOrFailure
		| ShapeNotFailure
		| Failure

	type ShapeAndFailure = {
		type: "ShapeAndFailure"
		errors: {}[]
	}

	type ShapeOrFailure = {
		type: "ShapeOrFailure"
		errors: {}[]
	}

	type ShapeNotFailure = {
		type: "ShapeNotFailure"
		errors: {}[]
	}

	type Failure = {
		type: "Failure"
		shape: string
		node: string
		errors: {}[]
	}

	type ShapeAndResults = {
		type: "ShapeAndResults"
		solutions: SuccessResult[]
	}

	type ShapeOrResults = {
		type: "ShapeOrResults"
		solution: SuccessResult
	}

	type ShapeNotResults = {
		type: "ShapeNotResult"
		solution: SuccessResult
	}

	interface NodeTest {
		type: "NodeTest"
		node: string
		shape: string
		shapeExpr: shapeExpr
	}

	interface ShapeTestT extends ShapeTest<SuccessResult> {}
	type ShapeTest<R> = {
		type: "ShapeTest"
		node: string
		shape: string
		solution: solutions<R>
		annotations?: Annotation[]
	}

	type solutions<R> =
		| EachOfSolutions<R>
		| OneOfSolutions<R>
		| TripleConstraintSolutions<R>

	type EachOfSolutions<R> = {
		type: "EachOfSolutions"
		solutions: EachOfSolution<R>[]
		min?: number
		max?: number
		annotations?: Annotation[]
	}

	type EachOfSolution<R> = {
		type: "EachOfSolution"
		expressions: solutions<R>[]
	}

	type OneOfSolutions<R> = {
		type: "OneOfSolutions"
		solutions: OneOfSolution<R>[]
		min?: number
		max?: number
		annotations?: Annotation[]
	}

	type OneOfSolution<R> = {
		type: "OneOfSolution"
		expressions: solutions<R>[]
	}

	type TripleConstraintSolutions<R, O = objectValue> = {
		type: "TripleConstraintSolutions"
		predicate: string
		solutions: TestedTriple<R, O>[]
		valueExpr?: shapeExpr
		min?: number
		max?: number
		annotations?: Annotation[]
	}

	type TestedTriple<R, O = objectValue> = {
		type: "TestedTriple"
		subject: string
		predicate: string
		object: O
		referenced?: R
	}
}
