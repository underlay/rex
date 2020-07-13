import * as RDF from "rdf-js";
import { TypeOf } from "io-ts/es6/index.js";
import { Schema } from "./schema.js";
export declare type Table = Map<string, Map<string, Set<string>>>;
export declare function materialize(s: TypeOf<typeof Schema>, datasets: RDF.Quad[][]): Map<string, Table>;
export declare function getDataset(s: TypeOf<typeof Schema>, tables: Map<string, Table>): RDF.Quad[];
