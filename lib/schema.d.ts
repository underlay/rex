import { TypeOf, Type } from "io-ts/es6/index.js";
import ShExParser from "@shexjs/parser";
declare const SemAct: import("io-ts/es6").IntersectionC<[import("io-ts/es6").TypeC<{
    type: import("io-ts/es6").LiteralC<"SemAct">;
    name: import("io-ts/es6").StringC;
}>, import("io-ts/es6").PartialC<{
    code: import("io-ts/es6").StringC;
}>]>;
export declare type ShapeAnd = {
    type: "ShapeAnd";
    shapeExprs: [ShExParser.NodeConstraint, Shape];
};
export declare type shapeExpr = string | ShExParser.NodeConstraint | Shape | ShapeAnd;
export declare const ShapeAnd: Type<ShapeAnd>;
export declare const shapeExpr: Type<shapeExpr>;
export declare type valueExpr = shapeExpr | {
    type: "ShapeOr";
    shapeExprs: shapeExpr[];
};
export interface TripleConstraint {
    type: "TripleConstraint";
    predicate: string;
    valueExpr?: valueExpr;
    inverse?: false;
    semActs?: TypeOf<typeof SemAct>[];
    min?: number;
    max?: number;
    annotations?: ShExParser.Annotation[];
}
declare const TripleConstraint: Type<TripleConstraint>;
export interface Shape {
    type: "Shape";
    expression: TypeOf<typeof TripleConstraint> | TypeOf<typeof EachOf>;
}
declare const EachOf: Type<EachOf<TripleConstraint, TripleConstraint>>;
declare const typedTripleConstraint: import("io-ts/es6").TypeC<{
    type: import("io-ts/es6").LiteralC<"TripleConstraint">;
    predicate: import("io-ts/es6").LiteralC<"http://www.w3.org/1999/02/22-rdf-syntax-ns#type">;
    valueExpr: import("io-ts/es6").TypeC<{
        type: import("io-ts/es6").LiteralC<"NodeConstraint">;
        values: import("io-ts/es6").TupleC<[import("io-ts/es6").StringC]>;
    }>;
}>;
declare type TypedTripleConstraints = [TypeOf<typeof typedTripleConstraint>, TripleConstraint, ...TripleConstraint[]];
declare const TypedTripleConstraints: Type<TypedTripleConstraints, TypedTripleConstraints, unknown>;
export declare const Schema: import("io-ts/es6").TypeC<{
    type: import("io-ts/es6").LiteralC<"Schema">;
    shapes: import("io-ts/es6").ArrayC<import("io-ts/es6").TypeC<{
        type: import("io-ts/es6").LiteralC<"ShapeAnd">;
        id: import("io-ts/es6").StringC;
        shapeExprs: import("io-ts/es6").TupleC<[import("io-ts/es6").TypeC<{
            type: import("io-ts/es6").LiteralC<"NodeConstraint">;
            nodeKind: import("io-ts/es6").LiteralC<"bnode">;
        }>, import("io-ts/es6").IntersectionC<[import("io-ts/es6").TypeC<{
            type: import("io-ts/es6").LiteralC<"Shape">;
            expression: import("io-ts/es6").UnionC<[import("io-ts/es6").TypeC<{
                type: import("io-ts/es6").LiteralC<"TripleConstraint">;
                predicate: import("io-ts/es6").LiteralC<"http://www.w3.org/1999/02/22-rdf-syntax-ns#type">;
                valueExpr: import("io-ts/es6").TypeC<{
                    type: import("io-ts/es6").LiteralC<"NodeConstraint">;
                    values: import("io-ts/es6").TupleC<[import("io-ts/es6").StringC]>;
                }>;
            }>, import("io-ts/es6").TypeC<{
                type: import("io-ts/es6").LiteralC<"EachOf">;
                expressions: Type<TypedTripleConstraints, TypedTripleConstraints, unknown>;
            }>]>;
        }>, import("io-ts/es6").PartialC<{
            annotations: import("io-ts/es6").ArrayC<import("io-ts/es6").TypeC<{
                type: import("io-ts/es6").LiteralC<"Annotation">;
                predicate: import("io-ts/es6").StringC;
                object: import("io-ts/es6").UnionC<[import("io-ts/es6").StringC, import("io-ts/es6").IntersectionC<[import("io-ts/es6").TypeC<{
                    value: import("io-ts/es6").StringC;
                }>, import("io-ts/es6").PartialC<{
                    language: import("io-ts/es6").StringC;
                    type: import("io-ts/es6").StringC;
                }>]>]>;
            }>>;
        }>]>]>;
    }>>;
}>;
interface EachOf<T1 extends TypeOf<typeof TripleConstraint>, T2 extends TypeOf<typeof TripleConstraint>> {
    type: "EachOf";
    expressions: [T1, T2, ...T2[]];
}
interface Expression<T1 extends TypeOf<typeof TripleConstraint>, T2 extends TypeOf<typeof TripleConstraint>> {
    type: "Shape";
    expression: T1 | EachOf<T1, T2>;
}
export declare function getExpressions<T1 extends TypeOf<typeof TripleConstraint>, T2 extends TypeOf<typeof TripleConstraint>>(shape: Expression<T1, T2>): [T1, ...T2[]];
export {};
