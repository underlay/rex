import RDF from "rdf-js";
import { TypeOf } from "io-ts/es6/index.js";
import { Schema } from "./schema.js";
export declare function materialize(schema: TypeOf<typeof Schema>, datasets: RDF.Quad[][]): RDF.Quad[];
