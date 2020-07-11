import * as RDF from "rdf-js";
import { TripleConstraint, sortLexicographic, sortDatatypeAnnotation, numericDatatype, AnnotatedTripleConstraint, temporalDatatype, booleanDatatype } from "./schema.js";
export declare type Order = (a: RDF.Term, b: RDF.Term) => boolean;
export declare function getLexicographicOrder(tripleConstraint: TripleConstraint & sortLexicographic): Order;
declare type First<T> = T extends [infer F, ...any[]] ? F : never;
export declare function getOrder(sort: First<NonNullable<sortDatatypeAnnotation["annotations"]>>["object"], datatype: numericDatatype | temporalDatatype | booleanDatatype | null): Order;
export declare function getTypeOrder(tripleConstraint: AnnotatedTripleConstraint): Order;
export {};
