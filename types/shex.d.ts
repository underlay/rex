declare module "@shexjs/parser" {
	function construct(): Parser

	interface Parser {
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

	type ShapeOr = {
		type: "ShapeOr"
		shapeExprs: shapeExpr[]
	}
	type ShapeAnd = {
		type: "ShapeAnd"
		shapeExprs: shapeExpr[]
	}
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
		| datatypeConstraint
		| valueSetConstraint
		| numericFacets

	type datatypeConstraint = { datatype: string } & xsFacets
	type valueSetConstraint = { values: valueSetValue[] } & xsFacets

	type stringLength =
		| { length: number }
		| { minlength?: number; maxlength?: number } // This doubles as an empty string facet

	type stringFacets = stringLength & { pattern?: string; flags?: string }

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

	type TripleConstraint<
		P extends string = string,
		V extends shapeExpr | undefined = shapeExpr | undefined
	> = {
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

declare module "@shexjs/core/lib/ShExUtil.js" {
	import * as RDF from "rdf-js"
	import { Schema, tripleExprObject, shapeExprObject } from "@shexjs/parser"
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

	type Index = {
		tripleExprs: { [id: string]: tripleExprObject }
		shapeExprs: { [id: string]: shapeExprObject }
	}

	export interface N3DB extends DB {}

	export function makeN3DB(store: DB): N3DB
	export function index(schema: Schema): Index
	export function emptySchema(): Schema
	export function merge(
		left: Schema,
		right: Schema,
		overwrite: boolean,
		inPlace: boolean
	): void
}

declare module "@shexjs/core" {
	import { Schema, shapeExpr, objectValue, Annotation } from "@shexjs/parser"

	import * as ShExUtil from "@shexjs/core/lib/ShExUtil.js"
	const Util: typeof ShExUtil
	type N3DB = ShExUtil.N3DB

	type Start = { term: "START" }
	class Validator {
		static start: Start
		static construct(
			schema: Schema,
			options?: { or?: string; partition?: string; results?: string }
		): Validator
		validate(
			db: ShExUtil.N3DB,
			id: string,
			start: shapeExpr
		): SuccessResult | FailureResult
		validate(
			db: ShExUtil.N3DB,
			point: string,
			shape: string | Start
		): ShapeTest | Failure // ???
	}

	type SuccessResult =
		| ShapeAndResults
		| ShapeOrResults
		| ShapeNotResults
		| ShapeTest
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

	type NodeTest = {
		type: "NodeTest"
		node: string
		shape: string
		shapeExpr: shapeExpr
	}

	// interface ShapeTestT extends ShapeTest<SuccessResult> {}
	type ShapeTest = {
		type: "ShapeTest"
		node: string
		shape: string
		solution: solutions
		annotations?: Annotation[]
	}

	type solutions = EachOfSolutions | OneOfSolutions | TripleConstraintSolutions

	type EachOfSolutions = {
		type: "EachOfSolutions"
		solutions: EachOfSolution[]
		min?: number
		max?: number
		annotations?: Annotation[]
	}

	type EachOfSolution = {
		type: "EachOfSolution"
		expressions: solutions[]
	}

	type OneOfSolutions = {
		type: "OneOfSolutions"
		solutions: OneOfSolution[]
		min?: number
		max?: number
		annotations?: Annotation[]
	}

	type OneOfSolution = {
		type: "OneOfSolution"
		expressions: solutions[]
	}

	type TripleConstraintSolutions<O = objectValue> = {
		type: "TripleConstraintSolutions"
		predicate: string
		solutions: TestedTriple<O>[]
		valueExpr?: shapeExpr
		min?: number
		max?: number
		annotations?: Annotation[]
	}

	type TestedTriple<O = objectValue> = {
		type: "TestedTriple"
		subject: string
		predicate: string
		object: O
		referenced?: SuccessResult
	}
}
