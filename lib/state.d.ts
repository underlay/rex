import RDF from "rdf-js";
import { N3Store } from "n3";
import { TypeOf } from "io-ts/es6/index.js";
import { Schema } from "./schema.js";
import { Order } from "./order.js";
export declare type Node = RDF.Quad_Object | Readonly<Tree>;
export declare type Property = {
    order: Order;
    values: Array<Node>;
    min: number;
    max: number;
    reference?: string;
    withReference?: string;
    graphs?: Map<string, Set<string>>;
};
export interface Tree {
    termType: "Tree";
    subject: RDF.Quad_Subject;
    properties: Map<string, Property>;
}
export declare const getNodeTerm: (node: Node) => RDF.Quad_Object;
export declare type State = Readonly<{
    references: Map<string, [string, string][][]>;
    metaReferences: Map<string, [string, string][][]>;
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
    shapeExpr: TypeOf<typeof Schema>["shapes"][0];
    key?: string;
}>>;
export declare function getTypeMap(schema: TypeOf<typeof Schema>): TypeMap;
export {};
