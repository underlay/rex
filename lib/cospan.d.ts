import RDF from "rdf-js";
import * as N3 from "n3";
import { shapeExpr } from "./schema.js";
export declare function cospan(types: Map<string, {
    type: string;
    shapeExpr: shapeExpr;
    key?: string;
}>, datasets: RDF.Quad[][]): {
    coproduct: N3.N3Store;
    components: Map<string, string>;
    inverse: Map<string, Set<string>>;
    pushout: N3.N3Store;
};
