import ShExParser from "@shexjs/parser";
import ShExCore from "@shexjs/core";
import { Type, CoproductType } from "./schema.js";
export declare function isShapeOrResult(result: ShExCore.SuccessResult): result is ShExCore.ShapeOrResults;
export declare function isShapeOr(shapeExpr: ShExParser.shapeExpr): shapeExpr is ShExParser.ShapeOr;
export declare function makeCoproductShape(type: CoproductType, makeShapeExpr: (type: Type) => ShExParser.shapeExpr): ShExParser.ShapeOr;
export declare function matchResultOption(result: ShExCore.SuccessResult, shapeExprs: ShExParser.shapeExpr[]): number;
