import RDF from "rdf-js";
import * as N3 from "n3";
export declare const fromId: (id: string) => RDF.Term, toId: (term: RDF.Term) => string;
export declare const rdfType = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
export declare const parseQuads: (input: string) => Promise<RDF.Quad[]>;
export declare const parseStore: (input: string) => Promise<N3.N3Store<RDF.Quad, N3.Quad>>;
export declare const writeStore: (store: N3.N3Store<RDF.Quad, N3.Quad>) => Promise<string>;
