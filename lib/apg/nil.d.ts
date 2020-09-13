import ShExParser from "@shexjs/parser";
import ShExCore from "@shexjs/core";
import { BlankNodeConstraint, BlankNodeConstraintResult, anyType, anyTypeResult } from "./utils.js";
export interface emptyShape extends ShExParser.Shape {
    closed: true;
    expression: anyType;
}
export declare const emptyShape: emptyShape;
export declare function isEmptyShape(shapeExpr: ShExParser.shapeExpr): shapeExpr is emptyShape;
declare type nilShapeExpr = {
    type: "ShapeAnd";
    shapeExprs: [BlankNodeConstraint, emptyShape];
};
export declare const nilShapeExpr: nilShapeExpr;
export declare function isNilShapeExpr(shapeExpr: ShExParser.shapeExpr): shapeExpr is nilShapeExpr;
export declare type EmptyShapeResult = {
    type: "ShapeTest";
    node: string;
    shape: string;
    solution: anyTypeResult;
};
export declare function isEmptyShapeResult(result: ShExCore.SuccessResult): result is EmptyShapeResult;
export declare type NilShapeResult = {
    type: "ShapeAndResults";
    solutions: [BlankNodeConstraintResult, EmptyShapeResult];
};
export declare function isNilShapeResult(result: ShExCore.SuccessResult): result is NilShapeResult;
export {};
