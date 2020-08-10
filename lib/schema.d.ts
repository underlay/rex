import t from "./io.js";
import * as ShExParser from "@shexjs/parser";
import { rex, xsd } from "./vocab.js";
import { integerDatatype } from "./satisfies.js";
import { dataTypeConstraint } from "./constraint.js";
export declare const lexicographic: t.UnionC<[t.LiteralC<"http://underlay.org/ns/rex#first">, t.LiteralC<"http://underlay.org/ns/rex#last">]>, numeric: t.UnionC<[t.LiteralC<"http://underlay.org/ns/rex#greatest">, t.LiteralC<"http://underlay.org/ns/rex#least">]>, temporal: t.UnionC<[t.LiteralC<"http://underlay.org/ns/rex#earliest">, t.LiteralC<"http://underlay.org/ns/rex#latest">]>, boolean: t.UnionC<[t.LiteralC<"http://underlay.org/ns/rex#all">, t.LiteralC<"http://underlay.org/ns/rex#any">]>;
interface annotation<P extends string, T extends string> {
    type: "Annotation";
    predicate: P;
    object: T;
}
declare const annotation: <P extends string, T extends string>(predicate: t.Type<P, P, unknown>, object: t.Type<T, T, unknown>) => t.Type<annotation<P, T>, annotation<P, T>, unknown>;
declare const sortAnnotation: t.Type<annotation<"http://underlay.org/ns/rex#sort", "http://underlay.org/ns/rex#first" | "http://underlay.org/ns/rex#last" | "http://underlay.org/ns/rex#greatest" | "http://underlay.org/ns/rex#least" | "http://underlay.org/ns/rex#earliest" | "http://underlay.org/ns/rex#latest" | "http://underlay.org/ns/rex#all" | "http://underlay.org/ns/rex#any">, annotation<"http://underlay.org/ns/rex#sort", "http://underlay.org/ns/rex#first" | "http://underlay.org/ns/rex#last" | "http://underlay.org/ns/rex#greatest" | "http://underlay.org/ns/rex#least" | "http://underlay.org/ns/rex#earliest" | "http://underlay.org/ns/rex#latest" | "http://underlay.org/ns/rex#all" | "http://underlay.org/ns/rex#any">, unknown>;
declare type nodeConstraint = Extract<ShExParser.NodeConstraint, {
    nodeKind: "iri";
} | ShExParser.literalNodeConstraint>;
export declare type shapeExpr = string | nodeConstraint;
export declare const shapeExpr: t.Type<shapeExpr>;
export declare const isDataTypeConstraint: (valueExpr: shapeExpr) => valueExpr is dataTypeConstraint<string>;
export declare type datatypeAnnotation<T extends string, S extends string> = {
    valueExpr: dataTypeConstraint<T>;
    annotations: [annotation<typeof rex.sort, S>] | [annotation<typeof rex.sort, S>, annotation<typeof rex.in, string>];
};
export declare type numericDatatype = t.TypeOf<typeof integerDatatype> | typeof xsd.double | typeof xsd.decimal | typeof xsd.float;
export declare type sortNumeric = datatypeAnnotation<numericDatatype, t.TypeOf<typeof numeric>>;
export declare type temporalDatatype = typeof xsd.dateTime | typeof xsd.date;
export declare type sortTemporal = datatypeAnnotation<temporalDatatype, t.TypeOf<typeof temporal>>;
export declare type booleanDatatype = typeof xsd.boolean;
export declare type sortBoolean = datatypeAnnotation<booleanDatatype, t.TypeOf<typeof boolean>>;
export declare type sortLexicographic = {
    annotations?: [annotation<typeof rex.sort, t.TypeOf<typeof lexicographic>>] | [annotation<typeof rex.sort, t.TypeOf<typeof lexicographic>>, annotation<typeof rex.in, string>];
};
export declare type sortDatatypeAnnotation = sortNumeric | sortTemporal | sortBoolean | sortLexicographic;
declare type tripleConstraintAnnotation = sortDatatypeAnnotation | sortReference | sortMetaReference;
export declare type sortReference = {
    annotations: [annotation<typeof rex.with, string>, sortAnnotation] | [annotation<typeof rex.with, string>, sortAnnotation, annotation<typeof rex.in, string>];
};
export declare type sortMetaReference = {
    annotations: [annotation<typeof rex.meta, string>, sortAnnotation, annotation<typeof rex.in, string>];
};
declare type sortAnnotation = annotation<typeof rex.sort, t.TypeOf<typeof numeric | typeof temporal | typeof boolean | typeof lexicographic>>;
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
export declare const numericValueExpr: t.Type<dataTypeConstraint<numericDatatype>, dataTypeConstraint<numericDatatype>, unknown>, temporalValueExpr: t.Type<dataTypeConstraint<temporalDatatype>, dataTypeConstraint<temporalDatatype>, unknown>, booleanValueExpr: t.Type<dataTypeConstraint<"http://www.w3.org/2001/XMLSchema#boolean">, dataTypeConstraint<"http://www.w3.org/2001/XMLSchema#boolean">, unknown>;
declare type TripleConstraints = [AnnotatedTripleConstraint, AnnotatedTripleConstraint, ...AnnotatedTripleConstraint[]];
declare const TripleConstraints: t.Type<TripleConstraints, TripleConstraints, unknown>;
export declare const Schema: t.Type<{
    type: "Schema";
    shapes: {
        type: "ShapeAnd";
        id: string;
        shapeExprs: [{
            type: "NodeConstraint";
            nodeKind: "bnode";
        }, {
            type: "Shape";
            expression: (TripleConstraint & datatypeAnnotation<numericDatatype, "http://underlay.org/ns/rex#greatest" | "http://underlay.org/ns/rex#least">) | (TripleConstraint & datatypeAnnotation<temporalDatatype, "http://underlay.org/ns/rex#earliest" | "http://underlay.org/ns/rex#latest">) | (TripleConstraint & datatypeAnnotation<"http://www.w3.org/2001/XMLSchema#boolean", "http://underlay.org/ns/rex#all" | "http://underlay.org/ns/rex#any">) | (TripleConstraint & sortLexicographic) | (TripleConstraint & sortReference) | (TripleConstraint & sortMetaReference) | {
                type: "EachOf";
                expressions: TripleConstraints;
            };
        } & {
            annotations?: [annotation<"http://underlay.org/ns/rex#key", string>] | undefined;
        }];
    }[];
}, {
    type: "Schema";
    shapes: {
        type: "ShapeAnd";
        id: string;
        shapeExprs: [{
            type: "NodeConstraint";
            nodeKind: "bnode";
        }, {
            type: "Shape";
            expression: (TripleConstraint & datatypeAnnotation<numericDatatype, "http://underlay.org/ns/rex#greatest" | "http://underlay.org/ns/rex#least">) | (TripleConstraint & datatypeAnnotation<temporalDatatype, "http://underlay.org/ns/rex#earliest" | "http://underlay.org/ns/rex#latest">) | (TripleConstraint & datatypeAnnotation<"http://www.w3.org/2001/XMLSchema#boolean", "http://underlay.org/ns/rex#all" | "http://underlay.org/ns/rex#any">) | (TripleConstraint & sortLexicographic) | (TripleConstraint & sortReference) | (TripleConstraint & sortMetaReference) | {
                type: "EachOf";
                expressions: TripleConstraints;
            };
        } & {
            annotations?: [annotation<"http://underlay.org/ns/rex#key", string>] | undefined;
        }];
    }[];
}, {
    type: "Schema";
    shapes: {
        type: "ShapeAnd";
        id: string;
        shapeExprs: [{
            type: "NodeConstraint";
            nodeKind: "bnode";
        }, {
            type: "Shape";
            expression: (TripleConstraint & datatypeAnnotation<numericDatatype, "http://underlay.org/ns/rex#greatest" | "http://underlay.org/ns/rex#least">) | (TripleConstraint & datatypeAnnotation<temporalDatatype, "http://underlay.org/ns/rex#earliest" | "http://underlay.org/ns/rex#latest">) | (TripleConstraint & datatypeAnnotation<"http://www.w3.org/2001/XMLSchema#boolean", "http://underlay.org/ns/rex#all" | "http://underlay.org/ns/rex#any">) | (TripleConstraint & sortLexicographic) | (TripleConstraint & sortReference) | (TripleConstraint & sortMetaReference) | {
                type: "EachOf";
                expressions: TripleConstraints;
            };
        } & {
            annotations?: [annotation<"http://underlay.org/ns/rex#key", string>] | undefined;
        }];
    }[];
}>;
export declare const getExpressions: ({ expression, }: {
    type: "Shape";
    expression: (TripleConstraint & datatypeAnnotation<numericDatatype, "http://underlay.org/ns/rex#greatest" | "http://underlay.org/ns/rex#least">) | (TripleConstraint & datatypeAnnotation<temporalDatatype, "http://underlay.org/ns/rex#earliest" | "http://underlay.org/ns/rex#latest">) | (TripleConstraint & datatypeAnnotation<"http://www.w3.org/2001/XMLSchema#boolean", "http://underlay.org/ns/rex#all" | "http://underlay.org/ns/rex#any">) | (TripleConstraint & sortLexicographic) | (TripleConstraint & sortReference) | (TripleConstraint & sortMetaReference) | {
        type: "EachOf";
        expressions: TripleConstraints;
    };
} & {
    annotations?: [annotation<"http://underlay.org/ns/rex#key", string>] | undefined;
}) => [AnnotatedTripleConstraint, ...AnnotatedTripleConstraint[]];
export {};
