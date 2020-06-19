import { TypeOf } from "io-ts/es6/index.js";
import { Quad, N3Store } from "n3";
import { Schema } from "./schema.js";
export declare function materialize(schema: TypeOf<typeof Schema>, datasets: N3Store[]): Quad[];
