import { TypeOf, Type } from "io-ts/es6/index.js";
import ShExParser from "@shexjs/parser";
import { xsdDecimal, xsdFloat, xsdDouble, integerDatatype } from "./satisfies.js";
import { dataTypeConstraint } from "./constraint.js";
import { rex, xsdDateTime, xsdDate, xsdBoolean } from "./vocab.js";
interface sortAnnotation<T extends string> {
    type: "Annotation";
    predicate: typeof rex.sort;
    object: T;
}
export declare const lexicographic: import("io-ts/es6").UnionC<[import("io-ts/es6").LiteralC<"http://underlay.org/ns/rex#ascending">, import("io-ts/es6").LiteralC<"http://underlay.org/ns/rex#descending">]>;
export declare const numeric: import("io-ts/es6").UnionC<[import("io-ts/es6").LiteralC<"http://underlay.org/ns/rex#greater">, import("io-ts/es6").LiteralC<"http://underlay.org/ns/rex#lesser">]>;
export declare const temporal: import("io-ts/es6").UnionC<[import("io-ts/es6").LiteralC<"http://underlay.org/ns/rex#earlier">, import("io-ts/es6").LiteralC<"http://underlay.org/ns/rex#later">]>;
export declare const boolean: import("io-ts/es6").UnionC<[import("io-ts/es6").LiteralC<"http://underlay.org/ns/rex#and">, import("io-ts/es6").LiteralC<"http://underlay.org/ns/rex#or">]>;
declare const sortAnnotation: <T extends string>(object: Type<T, T, unknown>) => Type<sortAnnotation<T>, sortAnnotation<T>, unknown>;
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
export declare type sortDatatype<T extends string, S extends string> = {
    valueExpr: dataTypeConstraint<T>;
    annotations: [sortAnnotation<S>];
};
export declare type numericDatatype = TypeOf<typeof integerDatatype> | typeof xsdDouble | typeof xsdDecimal | typeof xsdFloat;
export declare type sortNumeric = sortDatatype<numericDatatype, TypeOf<typeof numeric>>;
export declare type temporalDatatype = typeof xsdDateTime | typeof xsdDate;
export declare type sortTemporal = sortDatatype<temporalDatatype, TypeOf<typeof temporal>>;
export declare type booleanDatatype = typeof xsdBoolean;
export declare type sortBoolean = sortDatatype<booleanDatatype, TypeOf<typeof boolean>>;
export declare type sortLexicographic = {
    valueExpr?: valueExpr;
    annotations?: [sortAnnotation<TypeOf<typeof lexicographic>>];
};
declare type tripleConstraintAnnotation = sortNumeric | sortTemporal | sortBoolean | sortLexicographic;
export declare function isNumeric(tripleConstraint: tripleConstraintAnnotation): tripleConstraint is sortNumeric;
export declare function isTemporal(tripleConstraint: tripleConstraintAnnotation): tripleConstraint is sortTemporal;
export declare function isBoolean(tripleConstraint: tripleConstraintAnnotation): tripleConstraint is sortBoolean;
export declare function isSortAnnotation(tripleConstraint: baseTripleConstraint & (sortNumeric | sortTemporal | sortBoolean | sortLexicographic)): tripleConstraint is baseTripleConstraint & (sortNumeric | sortTemporal | sortBoolean);
export declare type baseTripleConstraint = {
    type: "TripleConstraint";
    predicate: string;
    inverse?: false;
    min?: number;
    max?: number;
};
export declare type TripleConstraint = baseTripleConstraint & tripleConstraintAnnotation;
declare const TripleConstraint: Type<TripleConstraint>;
export interface Shape {
    type: "Shape";
    expression: TripleConstraint | TypeOf<typeof EachOf>;
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
export declare const isEmptyProductShape: (shape: {
    type: "Shape";
    expression: {
        type: "TripleConstraint";
        predicate: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
        valueExpr: {
            type: "NodeConstraint";
            values: [string];
        };
    };
} | ({
    type: "Shape";
    expression: {
        type: "EachOf";
        expressions: TypedTripleConstraints;
    };
} & {
    annotations?: [{
        type: "Annotation";
        predicate: "http://underlay.org/ns/rex#key";
        object: string;
    }] | undefined;
})) => shape is {
    type: "Shape";
    expression: {
        type: "TripleConstraint";
        predicate: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
        valueExpr: {
            type: "NodeConstraint";
            values: [string];
        };
    };
};
interface KeyedSchemaBrand {
    readonly KeyedSchema: unique symbol;
}
export declare const Schema: import("io-ts/es6").BrandC<import("io-ts/es6").TypeC<{
    type: import("io-ts/es6").LiteralC<"Schema">;
    shapes: import("io-ts/es6").ArrayC<import("io-ts/es6").TypeC<{
        type: import("io-ts/es6").LiteralC<"ShapeAnd">;
        id: import("io-ts/es6").StringC;
        shapeExprs: import("io-ts/es6").TupleC<[import("io-ts/es6").TypeC<{
            type: import("io-ts/es6").LiteralC<"NodeConstraint">;
            nodeKind: import("io-ts/es6").LiteralC<"bnode">;
        }>, import("io-ts/es6").UnionC<[import("io-ts/es6").TypeC<{
            type: import("io-ts/es6").LiteralC<"Shape">;
            expression: import("io-ts/es6").TypeC<{
                type: import("io-ts/es6").LiteralC<"TripleConstraint">;
                predicate: import("io-ts/es6").LiteralC<"http://www.w3.org/1999/02/22-rdf-syntax-ns#type">;
                valueExpr: import("io-ts/es6").TypeC<{
                    type: import("io-ts/es6").LiteralC<"NodeConstraint">;
                    values: import("io-ts/es6").TupleC<[import("io-ts/es6").StringC]>;
                }>;
            }>;
        }>, import("io-ts/es6").IntersectionC<[import("io-ts/es6").TypeC<{
            type: import("io-ts/es6").LiteralC<"Shape">;
            expression: import("io-ts/es6").TypeC<{
                type: import("io-ts/es6").LiteralC<"EachOf">;
                expressions: Type<TypedTripleConstraints, TypedTripleConstraints, unknown>;
            }>;
        }>, import("io-ts/es6").PartialC<{
            annotations: import("io-ts/es6").TupleC<[import("io-ts/es6").TypeC<{
                type: import("io-ts/es6").LiteralC<"Annotation">;
                predicate: import("io-ts/es6").LiteralC<"http://underlay.org/ns/rex#key">;
                object: import("io-ts/es6").StringC;
            }>]>;
        }>]>]>]>;
    }>>;
}>, KeyedSchemaBrand>;
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
