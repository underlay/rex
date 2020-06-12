import { TypeOf } from "io-ts/es6/index.js";
import * as N3 from "n3";
import RDF from "rdf-js";
import { Schema } from "./schema.js";
export declare function materialize(schema: TypeOf<typeof Schema>, datasets: RDF.Quad[][]): N3.Quad[];
