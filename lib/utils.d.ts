import RDF from "rdf-js";
import * as N3 from "n3";
import { RemoteDocument } from "jsonld/jsonld-spec";
export declare const fromId: (id: string) => RDF.Term, toId: (term: RDF.Term) => string;
export declare const parseQuads: (input: string) => Promise<RDF.Quad[]>;
export declare const parseStore: (input: string) => Promise<N3.N3Store<RDF.Quad, N3.Quad>>;
export declare const writeStore: (store: N3.N3Store<RDF.Quad, N3.Quad>) => Promise<string>;
export declare const parseJsonLd: (input: {}, documentLoader?: ((url: string) => Promise<RemoteDocument>) | undefined) => Promise<RDF.Quad[]>;
