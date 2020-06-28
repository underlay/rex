import { baseTripleConstraint, sortLexicographic, sortNumeric, sortBoolean, sortTemporal } from "./schema.js";
import { Node } from "./state.js";
export declare type Order = (a: Node, b: Node) => boolean;
export declare function getLexicographicOrder(tripleConstraint: baseTripleConstraint & sortLexicographic): Order;
export declare function getTypeOrder<S extends sortNumeric | sortTemporal | sortBoolean>(tripleConstraint: baseTripleConstraint & S): Order;
