import { TypedLiteral } from "./satisfies.js";
import { baseTripleConstraint, sortLexicographic, sortNumeric, sortBoolean, sortTemporal } from "./schema.js";
import { Node } from "./state.js";
declare type Order<T extends Node> = (a: T, b: T) => boolean;
export declare function getOrder(tripleConstraint: baseTripleConstraint & sortLexicographic): Order<Node>;
export declare function getTypeOrder<S extends sortNumeric | sortTemporal | sortBoolean>(tripleConstraint: baseTripleConstraint & S): Order<TypedLiteral<S["valueExpr"]["datatype"]>>;
export {};
