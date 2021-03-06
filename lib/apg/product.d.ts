import ShExParser from "@shexjs/parser";
import ShExCore from "@shexjs/core";
import { Type, ProductType } from "./schema.js";
import { BlankNodeConstraintResult, anyTypeResult, BlankNodeConstraint, anyType } from "./utils.js";
export declare type ProductShape = {
    type: "ShapeAnd";
    shapeExprs: [BlankNodeConstraint, {
        type: "Shape";
        closed: true;
        expression: ProductExpression;
    }];
};
export declare type ProductExpression = {
    type: "EachOf";
    expressions: [anyType, ...ComponentExpression[]];
};
export declare type ComponentExpression = {
    type: "TripleConstraint";
    predicate: string;
    valueExpr: ShExParser.shapeExpr;
};
export declare function isProductShape(shapeExpr: ShExParser.shapeExpr): shapeExpr is ProductShape;
export declare function makeProductShape(type: ProductType, makeShapeExpr: (type: Type) => ShExParser.shapeExpr): ProductShape;
export declare type ComponentResult = {
    type: "TripleConstraintSolutions";
    predicate: string;
    valueExpr: ShExParser.shapeExpr;
    solutions: [{
        type: "TestedTriple";
        subject: string;
        predicate: string;
        object: ShExParser.objectValue;
        referenced?: ShExCore.SuccessResult;
    }];
};
export declare function isComponentResult(result: ShExCore.solutions): result is ComponentResult;
export declare type ProductResult = {
    type: "ShapeAndResults";
    solutions: [BlankNodeConstraintResult, {
        type: "ShapeTest";
        node: string;
        shape: string;
        solution: {
            type: "EachOfSolutions";
            solutions: [{
                type: "EachOfSolution";
                expressions: [anyTypeResult, ...ComponentResult[]];
            }];
        };
    }];
};
export declare function isProductResult(result: ShExCore.SuccessResult): result is ProductResult;
export declare function parseProductResult(result: ProductResult): ComponentResult[];
