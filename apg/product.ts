import { IRIs } from "n3.ts"

import ShExParser from "@shexjs/parser"
import ShExCore from "@shexjs/core"

import { Type, ProductType } from "./schema.js"
import {
	BlankNodeConstraintResult,
	anyTypeResult,
	isBlankNodeConstraintResult,
	isAnyTypeResult,
	BlankNodeConstraint,
	anyType,
	isAnyType,
	isBlankNodeConstraint,
	blankNodeConstraint,
} from "./utils.js"

export type ProductShape = {
	type: "ShapeAnd"
	shapeExprs: [
		BlankNodeConstraint,
		{
			type: "Shape"
			closed: true
			expression: ProductExpression
		}
	]
}

export type ProductExpression = {
	type: "EachOf"
	expressions: [anyType, ...ComponentExpression[]]
}

export type ComponentExpression = {
	type: "TripleConstraint"
	predicate: string
	valueExpr: ShExParser.shapeExpr
}

function isProductShapeEachOf(
	tripleExpr: ShExParser.tripleExpr
): tripleExpr is ProductExpression {
	if (typeof tripleExpr === "string") {
		return false
	} else if (tripleExpr.type !== "EachOf") {
		return false
	} else if (tripleExpr.expressions.length === 0) {
		return false
	}
	const [first, ...rest] = tripleExpr.expressions
	return isAnyType(first) && rest.every(isComponentExpression)
}

function isComponentExpression(
	tripleExpr: ShExParser.tripleExpr
): tripleExpr is ComponentExpression {
	return (
		typeof tripleExpr !== "string" && tripleExpr.type === "TripleConstraint"
	)
}

export function isProductShape(
	shapeExpr: ShExParser.shapeExpr
): shapeExpr is ProductShape {
	if (typeof shapeExpr === "string") {
		return false
	} else if (shapeExpr.type !== "ShapeAnd") {
		return false
	} else if (shapeExpr.shapeExprs.length !== 2) {
		return false
	}

	const [nodeConstraint, shape] = shapeExpr.shapeExprs

	if (typeof shape === "string") {
		return false
	} else if (shape.type !== "Shape") {
		return false
	} else if (shape.closed !== true) {
		return false
	} else if (shape.expression === undefined) {
		return false
	}

	return (
		isBlankNodeConstraint(nodeConstraint) &&
		isProductShapeEachOf(shape.expression)
	)
}

export function makeProductShape(
	type: ProductType,
	makeShapeExpr: (type: Type) => ShExParser.shapeExpr
): ProductShape {
	const expression = makeProductShapeExpression(type, makeShapeExpr)
	return {
		type: "ShapeAnd",
		shapeExprs: [
			blankNodeConstraint,
			{ type: "Shape", closed: true, expression },
		],
	}
}

function makeProductShapeExpression(
	type: ProductType,
	makeShapeExpr: (type: Type) => ShExParser.shapeExpr
): ProductExpression {
	const expressions: [anyType, ...ComponentExpression[]] = [anyType]
	const values: Set<string> = new Set()
	for (const { key, value } of type.components) {
		if (key === IRIs.rdf.type) {
			throw new Error("Product object cannot have an rdf:type component")
		} else if (values.has(key)) {
			throw new Error("Product objects cannot repeat component values")
		}
		values.add(key)
		expressions.push({
			type: "TripleConstraint",
			predicate: key,
			valueExpr: makeShapeExpr(value),
		})
	}
	return { type: "EachOf", expressions }
}

export type ComponentResult = {
	type: "TripleConstraintSolutions"
	predicate: string
	valueExpr: ShExParser.shapeExpr
	solutions: [
		{
			type: "TestedTriple"
			subject: string
			predicate: string
			object: ShExParser.objectValue
			referenced?: ShExCore.SuccessResult
		}
	]
}

export function isComponentResult(
	result: ShExCore.solutions
): result is ComponentResult {
	return (
		result.type === "TripleConstraintSolutions" && result.solutions.length === 1
	)
}

export type ProductResult = {
	type: "ShapeAndResults"
	solutions: [
		BlankNodeConstraintResult,
		{
			type: "ShapeTest"
			node: string
			shape: string
			solution: {
				type: "EachOfSolutions"
				solutions: [
					{
						type: "EachOfSolution"
						expressions: [anyTypeResult, ...ComponentResult[]]
					}
				]
			}
		}
	]
}

export function isProductResult(
	result: ShExCore.SuccessResult
): result is ProductResult {
	if (result.type !== "ShapeAndResults") {
		return false
	} else if (result.solutions.length !== 2) {
		return false
	}
	const [nodeConstraint, shape] = result.solutions
	if (shape.type !== "ShapeTest") {
		return false
	} else if (shape.solution.type !== "EachOfSolutions") {
		return false
	} else if (shape.solution.solutions.length !== 1) {
		return false
	}
	const [{ expressions }] = shape.solution.solutions
	const [first, ...rest] = expressions
	return (
		isBlankNodeConstraintResult(nodeConstraint) &&
		isAnyTypeResult(first) &&
		rest.every(isComponentResult)
	)
}

export function parseProductResult(result: ProductResult): ComponentResult[] {
	const [{}, shape] = result.solutions
	const [{ expressions }] = shape.solution.solutions
	const [{}, ...rest] = expressions
	return rest
}
