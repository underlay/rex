import { Schema, shapeExprObject, tripleExprObject } from "@shexjs/parser"

export function getLinkMapClosure(
	linkMap: Map<string, Set<string>>
): Map<string, Set<string>> {
	const linkMapClosure: Map<string, Set<string>> = new Map()
	for (const [id, links] of linkMap.entries()) {
		const closure: Set<string> = new Set()
		for (const link of links) {
			addLink(link, closure, linkMap)
		}
		linkMapClosure.set(id, closure)
	}
	return linkMapClosure
}

function addLink(
	a: string,
	closure: Set<string>,
	linkMap: Map<string, Set<string>>
) {
	if (!closure.has(a)) {
		closure.add(a)
		for (const b of linkMap.get(a)!) {
			addLink(b, closure, linkMap)
		}
	}
}

export function getLinkMap(schema: Schema): Map<string, Set<string>> {
	const linkMap: Map<string, Set<string>> = new Map()
	for (const shape of schema.shapes || []) {
		const links: Set<string> = new Set()
		getShapeLinks(shape, links)
		linkMap.set(shape.id, links)
	}
	return linkMap
}

function getShapeLinks(shape: shapeExprObject, links: Set<string>) {
	if (shape.type === "ShapeAnd") {
		for (const [i, shapeExpr] of shape.shapeExprs.entries()) {
			if (typeof shapeExpr === "string") {
				links.add(shapeExpr)
			} else {
				getShapeLinks(shapeExpr, links)
			}
		}
	} else if (shape.type === "ShapeOr") {
		for (const shapeExpr of shape.shapeExprs) {
			if (typeof shapeExpr === "string") {
				links.add(shapeExpr)
			} else {
				getShapeLinks(shapeExpr, links)
			}
		}
	} else if (shape.type === "Shape") {
		if (typeof shape.expression === "string") {
			links.add(shape.expression)
		} else if (shape.expression) {
			getExpressionLinks(shape.expression, links)
		}
	}
}

function getExpressionLinks(expression: tripleExprObject, links: Set<string>) {
	if (expression.type === "EachOf") {
		for (const tripleExpr of expression.expressions) {
			if (typeof tripleExpr !== "string") {
				getExpressionLinks(tripleExpr, links)
			}
		}
	} else if (expression.type === "OneOf") {
		for (const tripleExpr of expression.expressions) {
			if (typeof tripleExpr !== "string") {
				getExpressionLinks(tripleExpr, links)
			}
		}
	} else if (expression.type === "TripleConstraint") {
		if (typeof expression.valueExpr === "string") {
			links.add(expression.valueExpr)
		} else if (expression.valueExpr) {
			getShapeLinks(expression.valueExpr, links)
		}
	}
}
