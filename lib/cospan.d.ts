import { N3Store } from "n3";
import { shapeExpr } from "./schema.js";
export declare function cospan(types: Map<string, {
    type: string;
    shapeExpr: shapeExpr;
    key?: string;
}>, datasets: N3Store[]): {
    coproduct: N3Store;
    components: Map<string, string>;
    inverse: Map<string, Set<string>>;
    pushout: N3Store;
};
