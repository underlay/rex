import { IRIs } from "n3.ts";
import ShExParser from "@shexjs/parser";
import ShExCore from "@shexjs/core";
import { Label } from "./schema.js";
export declare type LabelShape = {
    id: string;
    type: "ShapeAnd";
    shapeExprs: [{
        type: "Shape";
        extra: ["http://www.w3.org/1999/02/22-rdf-syntax-ns#type"];
        expression: {
            type: "TripleConstraint";
            predicate: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
            valueExpr: {
                type: "NodeConstraint";
                values: [string];
            };
        };
    }, ShExParser.shapeExpr];
};
export declare function makeLabelShape(type: Label, value: ShExParser.shapeExpr): LabelShape;
export declare type LabelResult = {
    type: "ShapeAndResults";
    solutions: [{
        type: "ShapeTest";
        node: string;
        shape: string;
        solution: {
            type: "TripleConstraintSolutions";
            predicate: typeof IRIs.rdf.type;
            solutions: [{
                type: "TestedTriple";
                subject: string;
                predicate: typeof IRIs.rdf.type;
                object: string;
            }];
        };
    }, ShExCore.SuccessResult];
};
export declare function isLabelResult(result: ShExCore.SuccessResult): result is LabelResult;
export declare function parseLabelResult(result: LabelResult): [string, string, ShExCore.SuccessResult];
