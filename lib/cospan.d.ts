import RDF from "rdf-js";
import { Store } from "n3";
import { Schema } from "./schema.js";
import { TypeOf } from "io-ts/es6/index.js";
export declare function cospan(types: Map<string, {
    type: string;
    shapeExpr: TypeOf<typeof Schema>["shapes"][0];
    key?: string;
}>, datasets: RDF.Quad[][]): {
    coproduct: Store;
    components: Map<string, string>;
    inverse: Map<string, Set<string>>;
    pushout: Store;
};
