import { TypeOf, Type } from "io-ts/es6/index.js";
import ShExParser from "@shexjs/parser";
import { rex, xsd } from "./vocab.js";
import { integerDatatype } from "./satisfies.js";
import { dataTypeConstraint } from "./constraint.js";
export declare const lexicographic: import("io-ts/es6").UnionC<[import("io-ts/es6").LiteralC<"http://underlay.org/ns/rex#first">, import("io-ts/es6").LiteralC<"http://underlay.org/ns/rex#last">]>, numeric: import("io-ts/es6").UnionC<[import("io-ts/es6").LiteralC<"http://underlay.org/ns/rex#greatest">, import("io-ts/es6").LiteralC<"http://underlay.org/ns/rex#least">]>, temporal: import("io-ts/es6").UnionC<[import("io-ts/es6").LiteralC<"http://underlay.org/ns/rex#earliest">, import("io-ts/es6").LiteralC<"http://underlay.org/ns/rex#latest">]>, boolean: import("io-ts/es6").UnionC<[import("io-ts/es6").LiteralC<"http://underlay.org/ns/rex#all">, import("io-ts/es6").LiteralC<"http://underlay.org/ns/rex#any">]>;
interface annotation<P extends string, T extends string> {
    type: "Annotation";
    predicate: P;
    object: T;
}
declare const annotation: <P extends string, T extends string>(predicate: Type<P, P, unknown>, object: Type<T, T, unknown>) => Type<annotation<P, T>, annotation<P, T>, unknown>;
declare const sortAnnotation: Type<annotation<"http://underlay.org/ns/rex#sort", "http://underlay.org/ns/rex#first" | "http://underlay.org/ns/rex#last" | "http://underlay.org/ns/rex#greatest" | "http://underlay.org/ns/rex#least" | "http://underlay.org/ns/rex#earliest" | "http://underlay.org/ns/rex#latest" | "http://underlay.org/ns/rex#all" | "http://underlay.org/ns/rex#any">, annotation<"http://underlay.org/ns/rex#sort", "http://underlay.org/ns/rex#first" | "http://underlay.org/ns/rex#last" | "http://underlay.org/ns/rex#greatest" | "http://underlay.org/ns/rex#least" | "http://underlay.org/ns/rex#earliest" | "http://underlay.org/ns/rex#latest" | "http://underlay.org/ns/rex#all" | "http://underlay.org/ns/rex#any">, unknown>;
declare type nodeConstraint = Extract<ShExParser.NodeConstraint, {
    nodeKind: "iri";
} | ShExParser.literalNodeConstraint>;
export declare type shapeExpr = string | nodeConstraint;
export declare const shapeExpr: Type<shapeExpr>;
export declare const isDataTypeConstraint: (valueExpr: shapeExpr) => valueExpr is dataTypeConstraint<string>;
export declare type datatypeAnnotation<T extends string, S extends string> = {
    valueExpr: dataTypeConstraint<T>;
    annotations: [annotation<typeof rex.sort, S>] | [annotation<typeof rex.sort, S>, annotation<typeof rex.in, string>];
};
export declare type numericDatatype = TypeOf<typeof integerDatatype> | typeof xsd.double | typeof xsd.decimal | typeof xsd.float;
export declare type sortNumeric = datatypeAnnotation<numericDatatype, TypeOf<typeof numeric>>;
export declare type temporalDatatype = typeof xsd.dateTime | typeof xsd.date;
export declare type sortTemporal = datatypeAnnotation<temporalDatatype, TypeOf<typeof temporal>>;
export declare type booleanDatatype = typeof xsd.boolean;
export declare type sortBoolean = datatypeAnnotation<booleanDatatype, TypeOf<typeof boolean>>;
export declare type sortLexicographic = {
    annotations?: [annotation<typeof rex.sort, TypeOf<typeof lexicographic>>] | [annotation<typeof rex.sort, TypeOf<typeof lexicographic>>, annotation<typeof rex.in, string>];
};
export declare type sortDatatypeAnnotation = sortNumeric | sortTemporal | sortBoolean | sortLexicographic;
declare type tripleConstraintAnnotation = sortDatatypeAnnotation | sortReference | sortMetaReference;
export declare type sortReference = {
    annotations: [annotation<typeof rex.with, string>, sortAnnotation] | [annotation<typeof rex.with, string>, sortAnnotation, annotation<typeof rex.in, string>];
};
export declare type sortMetaReference = {
    annotations: [annotation<typeof rex.meta, string>, sortAnnotation, annotation<typeof rex.in, string>];
};
declare type sortAnnotation = annotation<typeof rex.sort, TypeOf<typeof numeric | typeof temporal | typeof boolean | typeof lexicographic>>;
export declare function isNumeric(tripleConstraint: AnnotatedTripleConstraint): tripleConstraint is TripleConstraint & sortNumeric;
export declare function isTemporal(tripleConstraint: AnnotatedTripleConstraint): tripleConstraint is TripleConstraint & sortTemporal;
export declare function isBoolean(tripleConstraint: AnnotatedTripleConstraint): tripleConstraint is TripleConstraint & sortBoolean;
export declare function isDatatypeAnnotation(tripleConstraint: AnnotatedTripleConstraint): tripleConstraint is TripleConstraint & (sortNumeric | sortTemporal | sortBoolean);
export declare const isReferenceAnnotation: (tripleConstraint: AnnotatedTripleConstraint) => tripleConstraint is TripleConstraint & sortReference;
export declare const isMetaReferenceAnnotation: (tripleConstraint: AnnotatedTripleConstraint) => tripleConstraint is TripleConstraint & sortMetaReference;
export declare type TripleConstraint = {
    type: "TripleConstraint";
    predicate: string;
    valueExpr: shapeExpr;
    inverse?: false;
    min?: number;
    max?: number;
};
export declare type AnnotatedTripleConstraint = TripleConstraint & tripleConstraintAnnotation;
export declare const numericValueExpr: Type<dataTypeConstraint<numericDatatype>, dataTypeConstraint<numericDatatype>, unknown>, temporalValueExpr: Type<dataTypeConstraint<temporalDatatype>, dataTypeConstraint<temporalDatatype>, unknown>, booleanValueExpr: Type<dataTypeConstraint<"http://www.w3.org/2001/XMLSchema#boolean">, dataTypeConstraint<"http://www.w3.org/2001/XMLSchema#boolean">, unknown>;
declare const typedTripleConstraint: import("io-ts/es6").TypeC<{
    type: import("io-ts/es6").LiteralC<"TripleConstraint">;
    predicate: import("io-ts/es6").LiteralC<"http://www.w3.org/1999/02/22-rdf-syntax-ns#type">;
    valueExpr: import("io-ts/es6").TypeC<{
        type: import("io-ts/es6").LiteralC<"NodeConstraint">;
        values: import("io-ts/es6").TupleC<[import("io-ts/es6").StringC]>;
    }>;
}>;
declare type TypedTripleConstraint = TypeOf<typeof typedTripleConstraint>;
declare type TypedTripleConstraints = [TypedTripleConstraint, AnnotatedTripleConstraint, ...AnnotatedTripleConstraint[]];
declare const TypedTripleConstraints: Type<TypedTripleConstraints, TypedTripleConstraints, unknown>;
export declare const product: import("io-ts/es6").UnionC<[import("io-ts/es6").TypeC<{
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
    annotations: import("io-ts/es6").TupleC<[Type<annotation<"http://underlay.org/ns/rex#key", string>, annotation<"http://underlay.org/ns/rex#key", string>, unknown>]>;
}>]>]>;
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
    annotations?: [annotation<"http://underlay.org/ns/rex#key", string>] | undefined;
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
    readonly Keyed: unique symbol;
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
            annotations: import("io-ts/es6").TupleC<[Type<annotation<"http://underlay.org/ns/rex#key", string>, annotation<"http://underlay.org/ns/rex#key", string>, unknown>]>;
        }>]>]>]>;
    }>>;
}>, KeyedSchemaBrand>;
export declare const getExpressions: (shape: {
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
    annotations?: [annotation<"http://underlay.org/ns/rex#key", string>] | undefined;
})) => [{
    type: "TripleConstraint";
    predicate: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
    valueExpr: {
        type: "NodeConstraint";
        values: [string];
    };
}, ...AnnotatedTripleConstraint[]];
export {};
