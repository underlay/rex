declare module "@shex/parser" {
	function construct(): Parser

	class Parser {
		parse(shex: string): Schema
	}
}

declare module "@shex/core" {
	import { N3Store } from "n3"

	type DB = {}
	type Start = {}
	type Index = {
		tripleExprs: { [id: string]: tripleExprObject }
		shapeExprs: { [id: string]: shapeExprObject }
	}

	var Util: {
		makeN3DB(store: N3Store): DB
		index(schema: Schema): Index
	}

	class Validator {
		static construct(schema: Schema): Validator
		// validate(db: DB, id: string, start: shapeExpr): ValidationResult
		validate(
			db: DB,
			point: string,
			shape: shapeExprRef | Start
		): ShapeTestT | Failure // ???
		indexTripleConstraints(ref: tripleExprRef): tripleExprObject[]
		static start: Start
	}

	interface ShapeTestT extends ShapeTest<ShapeTestT> {}

	type ValidationResult = ShapeAndResults | FailureResult
	type FailureResult = {
		type: "ShapeAndFailure"
		errors: {}[]
	}

	type ShapeAndResults = {
		type: "ShapeAndResults"
		solutions: (NodeTest | ShapeTest<ShapeAndResults>)[]
	}

	interface NodeTest {
		type: "NodeTest"
		node: string
		shape: string
		shapeExpr: shapeExpr
	}

	type Failure = {
		type: "Failure"
		shape: string
		node: string
		errors: {}[]
	}

	type ShapeTest<R> = {
		type: "ShapeTest"
		node: string
		shape: string
		solution: solutions<R>
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
	}

	type OneOfSolution<R> = {
		type: "OneOfSolution"
		expressions: solutions<R>[]
	}

	type TripleConstraintSolutions<R> = {
		type: "TripleConstraintSolutions"
		predicate: string
		solutions: TestedTriple<R>[]
		valueExpr?: shapeExpr
		min?: number
		max?: number
	}

	type TestedTriple<R> = {
		type: "TestedTriple"
		subject: string
		predicate: string
		object: objectValue
		referenced?: R
	}

	interface Literal {
		value: string
		type?: string
	}

	interface NodeConstraint {
		type: "NodeConstraint"
		nodeKind?: string
		datatype?: string
		pattern?: string
	}
}
