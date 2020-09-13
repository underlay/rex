import ShExCore from "@shexjs/core"

import { DatatypeConstraint, isDatatypeConstraint } from "./utils.js"
import { LiteralType } from "./schema.js"

export type LiteralResult = {
	type: "NodeTest"
	node: string
	shape: string
	shapeExpr: DatatypeConstraint
}

export function isLiteralResult(
	result: ShExCore.SuccessResult
): result is LiteralResult {
	return result.type === "NodeTest" && isDatatypeConstraint(result.shapeExpr)
}

export type LiteralShape = DatatypeConstraint &
	({} | { pattern: string; flags: string })

export function makeLiteralShape({
	type,
	datatype,
	...rest
}: LiteralType): LiteralShape {
	return { type: "NodeConstraint", datatype, ...rest }
}
