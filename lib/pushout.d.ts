import { Store, QuadT } from "n3.ts";
import { ShapeMap } from "./state.js";
export declare function getCoproduct(datasets: QuadT[][]): Store;
export declare function getPushout(shapes: ShapeMap, coproduct: Store): {
    components: Map<string, string>;
    inverse: Map<string, Set<string>>;
    pushout: Store;
};
