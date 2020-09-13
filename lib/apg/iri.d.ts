import ShExParser from "@shexjs/parser";
import ShExCore from "@shexjs/core";
import { IriType } from "./schema.js";
import { NamedNodeConstraint } from "./utils.js";
import { emptyShape, EmptyShapeResult } from "./nil.js";
declare type IriShape = {
    type: "ShapeAnd";
    shapeExprs: [NamedNodeConstraint, emptyShape];
};
export declare function isIriShape(shapeExpr: ShExParser.shapeExpr): shapeExpr is IriShape;
export declare function parseIriShape(shapeExpr: IriShape): NamedNodeConstraint;
export declare type IriResult = {
    type: "ShapeAndResults";
    solutions: [NamedNodeConstraintResult, EmptyShapeResult];
};
export declare type NamedNodeConstraintResult = {
    type: "NodeTest";
    node: string;
    shape: string;
    shapeExpr: NamedNodeConstraint;
};
export declare function isNamedNodeConstraintResult(result: ShExCore.SuccessResult): result is NamedNodeConstraintResult;
export declare function isIriResult(result: ShExCore.SuccessResult): result is IriResult;
export declare function makeIriShape({ type, ...rest }: IriType): IriShape;
export {};
