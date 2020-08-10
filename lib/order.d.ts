import { Term, D } from "n3.ts";
import { TripleConstraint, sortLexicographic, sortDatatypeAnnotation, numericDatatype, AnnotatedTripleConstraint, temporalDatatype, booleanDatatype } from "./schema.js";
export declare type Order = (a: Term<D>, b: Term<D>) => boolean;
export declare function getLexicographicOrder(tripleConstraint: TripleConstraint & sortLexicographic): Order;
declare type First<T> = T extends [infer F, ...any[]] ? F : never;
export declare function getOrder(sort: First<NonNullable<sortDatatypeAnnotation["annotations"]>>["object"], datatype: numericDatatype | temporalDatatype | booleanDatatype | null): Order;
export declare function getTypeOrder(tripleConstraint: AnnotatedTripleConstraint): Order;
export {};
