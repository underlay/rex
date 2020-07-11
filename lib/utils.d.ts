import RDF from "rdf-js";
import * as N3 from "n3";
import { State } from "./state";
export declare type NamedNode = {
    termType: "NamedNode";
    value: string;
};
export declare type BlankNode = {
    termType: "BlankNode";
    value: string;
};
export declare type Literal = {
    termType: "Literal";
    langauge: string;
    datatype: NamedNode;
};
export declare type DefaultGraph = {
    termType: "DefaultGraph";
    value: "";
};
export declare type Quad = {
    subject: NamedNode | BlankNode;
    predicate: NamedNode;
    object: NamedNode | BlankNode | Literal;
    graph: NamedNode | BlankNode | DefaultGraph;
};
export declare const fromId: (id: string) => RDF.Term;
export declare const toId: (term: RDF.Term) => string;
export declare const parseQuads: (input: string) => Promise<RDF.Quad[]>;
export declare const parseStore: (input: string) => Promise<N3.Store<RDF.Quad, N3.Quad>>;
export declare const writeStore: (store: N3.Store<RDF.Quad, N3.Quad>) => Promise<string>;
export declare function image<T extends RDF.Term>(term: Exclude<T, RDF.BlankNode> | RDF.BlankNode, state: State): T | RDF.BlankNode;
export declare function preImage<T extends RDF.Term>(term: Exclude<T, RDF.BlankNode> | RDF.BlankNode, state: State): Generator<T | RDF.BlankNode, void, undefined>;
export declare const getRange: (min: number | undefined, max: number | undefined) => {
    min: number;
    max: number;
};
