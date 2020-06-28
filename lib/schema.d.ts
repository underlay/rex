import { TypeOf, Type } from "io-ts/es6/index.js";
import ShExParser from "@shexjs/parser";
import { integerDatatype } from "./satisfies.js";
import { dataTypeConstraint } from "./constraint.js";
import { rex, xsd } from "./vocab.js";
export declare const lexicographic: import("io-ts/es6").UnionC<[import("io-ts/es6").LiteralC<"http://underlay.org/ns/rex#first">, import("io-ts/es6").LiteralC<"http://underlay.org/ns/rex#last">]>;
export declare const numeric: import("io-ts/es6").UnionC<[import("io-ts/es6").LiteralC<"http://underlay.org/ns/rex#greatest">, import("io-ts/es6").LiteralC<"http://underlay.org/ns/rex#least">]>;
export declare const temporal: import("io-ts/es6").UnionC<[import("io-ts/es6").LiteralC<"http://underlay.org/ns/rex#earliest">, import("io-ts/es6").LiteralC<"http://underlay.org/ns/rex#latest">]>;
export declare const boolean: import("io-ts/es6").UnionC<[import("io-ts/es6").LiteralC<"http://underlay.org/ns/rex#all">, import("io-ts/es6").LiteralC<"http://underlay.org/ns/rex#any">]>;
interface annotation<P extends string, T extends string> {
    type: "Annotation";
    predicate: P;
    object: T;
}
declare const annotation: <P extends string, T extends string>(predicate: Type<P, P, unknown>, object: Type<T, T, unknown>) => Type<annotation<P, T>, annotation<P, T>, unknown>;
export declare type ShapeAnd = {
    type: "ShapeAnd";
    shapeExprs: [ShExParser.NodeConstraint, Shape];
};
export declare type shapeExpr = string | ShExParser.NodeConstraint | Shape | ShapeAnd;
export declare const ShapeAnd: Type<ShapeAnd>;
export declare const shapeExpr: Type<shapeExpr>;
export declare type datatypeAnnotation<T extends string, S extends string> = {
    valueExpr: dataTypeConstraint<T>;
    annotations: [annotation<typeof rex.sort, S>];
};
export declare type numericDatatype = TypeOf<typeof integerDatatype> | typeof xsd.double | typeof xsd.decimal | typeof xsd.float;
export declare type sortNumeric = datatypeAnnotation<numericDatatype, TypeOf<typeof numeric>>;
export declare type temporalDatatype = typeof xsd.dateTime | typeof xsd.date;
export declare type sortTemporal = datatypeAnnotation<temporalDatatype, TypeOf<typeof temporal>>;
export declare type booleanDatatype = typeof xsd.boolean;
export declare type sortBoolean = datatypeAnnotation<booleanDatatype, TypeOf<typeof boolean>>;
export declare type sortLexicographic = {
    valueExpr?: shapeExpr;
    annotations?: [annotation<typeof rex.sort, TypeOf<typeof lexicographic>>];
};
declare type sortDatatypeAnnotation = sortNumeric | sortTemporal | sortBoolean | sortLexicographic;
declare type tripleConstraintAnnotation = sortDatatypeAnnotation | sortWith | sortMeta | sortWithMeta;
export declare type sortWith = {
    valueExpr?: shapeExpr;
    annotations: [annotation<typeof rex.with, string>];
};
export declare type sortMeta = {
    valueExpr?: shapeExpr;
    annotations: [annotation<typeof rex.meta, string>];
};
export declare type sortWithMeta = {
    valueExpr?: shapeExpr;
    annotations: [annotation<typeof rex.meta, string>, annotation<typeof rex.with, string>];
};
export declare function isNumeric(tripleConstraint: tripleConstraintAnnotation): tripleConstraint is sortNumeric;
export declare function isTemporal(tripleConstraint: tripleConstraintAnnotation): tripleConstraint is sortTemporal;
export declare function isBoolean(tripleConstraint: tripleConstraintAnnotation): tripleConstraint is sortBoolean;
export declare function isDatatypeAnnotation(tripleConstraint: AnnotatedTripleConstraint): tripleConstraint is baseTripleConstraint & (sortNumeric | sortTemporal | sortBoolean);
export declare function isWithAnnotation(tripleConstraint: AnnotatedTripleConstraint): tripleConstraint is baseTripleConstraint & sortWith;
export declare function isMetaAnnotation(tripleConstraint: AnnotatedTripleConstraint): tripleConstraint is baseTripleConstraint & (sortMeta | sortWithMeta);
export declare type baseTripleConstraint = {
    type: "TripleConstraint";
    predicate: string;
    inverse?: false;
    min?: number;
    max?: number;
};
export declare type AnnotatedTripleConstraint = baseTripleConstraint & tripleConstraintAnnotation;
export declare type TripleConstraint = baseTripleConstraint & {
    valueExpr?: shapeExpr;
};
declare const TripleConstraint: Type<AnnotatedTripleConstraint>;
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
declare type TypedTripleConstraints = [TypeOf<typeof typedTripleConstraint>, AnnotatedTripleConstraint, ...AnnotatedTripleConstraint[]];
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
interface EachOf<T1 extends TypeOf<typeof TripleConstraint>, T2 extends TypeOf<typeof TripleConstraint>> {
    type: "EachOf";
    expressions: [T1, T2, ...T2[]];
}
interface Expression<T1 extends TypeOf<typeof TripleConstraint>, T2 extends TypeOf<typeof TripleConstraint>> {
    type: "Shape";
    expression: T1 | EachOf<T1, T2>;
}
export declare function getExpressions<T1 extends TypeOf<typeof TripleConstraint>, T2 extends TypeOf<typeof TripleConstraint>>(shape: Expression<T1, T2>): [T1, ...T2[]];
export declare const getShape: (shape: Shape | ShapeAnd) => [({
    type: "NodeConstraint";
} & {
    nodeKind?: "iri" | undefined;
} & {
    length: number;
} & {
    pattern: string;
    flags?: string | undefined;
}) | ({
    type: "NodeConstraint";
} & {
    nodeKind?: "iri" | undefined;
} & {
    minlength?: number | undefined;
    maxlength?: number | undefined;
} & {
    pattern: string;
    flags?: string | undefined;
}) | ({
    type: "NodeConstraint";
} & {
    nodeKind: "bnode" | "nonliteral";
}) | ({
    type: "NodeConstraint";
} & ShExParser.numericFacets) | ({
    type: "NodeConstraint";
} & {
    nodeKind: "literal";
} & {
    length: number;
} & {
    pattern: string;
    flags?: string | undefined;
} & ShExParser.numericFacets) | ({
    type: "NodeConstraint";
} & {
    nodeKind: "literal";
} & {
    minlength?: number | undefined;
    maxlength?: number | undefined;
} & {
    pattern: string;
    flags?: string | undefined;
} & ShExParser.numericFacets) | ({
    type: "NodeConstraint";
} & {
    dataType: string;
} & {
    length: number;
} & {
    pattern: string;
    flags?: string | undefined;
} & ShExParser.numericFacets) | ({
    type: "NodeConstraint";
} & {
    dataType: string;
} & {
    minlength?: number | undefined;
    maxlength?: number | undefined;
} & {
    pattern: string;
    flags?: string | undefined;
} & ShExParser.numericFacets) | ({
    type: "NodeConstraint";
} & {
    values: (ShExParser.valueSetValue[] & {
        length: number;
    } & {
        pattern: string;
        flags?: string | undefined;
    } & ShExParser.numericFacets) | (ShExParser.valueSetValue[] & {
        minlength?: number | undefined;
        maxlength?: number | undefined;
    } & {
        pattern: string;
        flags?: string | undefined;
    } & ShExParser.numericFacets);
}) | null, Shape];
export {};
