import RDF from "rdf-js";
import { N3Store } from "n3";
import { TypeOf } from "io-ts/es6/index.js";
import { ShapeAnd, Schema, numericDatatype, temporalDatatype, booleanDatatype } from "./schema.js";
import { TypedLiteral } from "./satisfies.js";
export declare type Node = RDF.Quad_Object | Readonly<Tree>;
export declare type Property<T extends Node> = {
    order: (a: T, b: T) => boolean;
    values: T[];
    min: number;
    max: number;
};
export interface Tree {
    termType: "Tree";
    subject: RDF.Quad_Subject;
    properties: Map<string, Property<Node> | Property<TypedLiteral<numericDatatype | temporalDatatype | booleanDatatype>>>;
}
export declare const getNodeTerm: (node: Node) => RDF.Quad_Object;
export declare type State = Readonly<{
    references: Map<string, [string, string][][]>;
    path: [string, string][];
    types: TypeMap;
    tables: Map<string, Map<string, Tree>>;
    coproduct: N3Store;
    components: Map<string, string>;
    inverse: Map<string, Set<string>>;
    pushout: N3Store;
}>;
declare type TypeMap = Map<string, Readonly<{
    type: string;
    shapeExpr: ShapeAnd;
    key?: string;
}>>;
export declare function getTypeMap(schema: TypeOf<typeof Schema>): TypeMap;
export {};
