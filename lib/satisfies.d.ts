import { Type } from "io-ts/es6/index.js";
import RDF from "rdf-js";
import ShExParser from "@shexjs/parser";
import { xsd } from "./vocab.js";
interface NamedNode<T extends string> extends RDF.NamedNode {
    value: T;
}
export interface TypedLiteral<T extends string> extends RDF.Literal {
    datatype: NamedNode<T>;
}
export declare const TypedLiteral: <T extends string>(value: Type<T, T, unknown>) => Type<TypedLiteral<T>, TypedLiteral<T>, RDF.Term>;
export declare const integerDatatype: import("io-ts/es6").UnionC<[import("io-ts/es6").LiteralC<"http://www.w3.org/2001/XMLSchema#integer">, import("io-ts/es6").LiteralC<"http://www.w3.org/2001/XMLSchema#positiveInteger">, import("io-ts/es6").LiteralC<"http://www.w3.org/2001/XMLSchema#nonPositiveInteger">, import("io-ts/es6").LiteralC<"http://www.w3.org/2001/XMLSchema#negativeInteger">, import("io-ts/es6").LiteralC<"http://www.w3.org/2001/XMLSchema#nonNegativeInteger">, import("io-ts/es6").LiteralC<"http://www.w3.org/2001/XMLSchema#long">, import("io-ts/es6").LiteralC<"http://www.w3.org/2001/XMLSchema#int">, import("io-ts/es6").LiteralC<"http://www.w3.org/2001/XMLSchema#short">, import("io-ts/es6").LiteralC<"http://www.w3.org/2001/XMLSchema#byte">, import("io-ts/es6").LiteralC<"http://www.w3.org/2001/XMLSchema#unsignedLong">, import("io-ts/es6").LiteralC<"http://www.w3.org/2001/XMLSchema#unsignedInt">, import("io-ts/es6").LiteralC<"http://www.w3.org/2001/XMLSchema#unsignedShort">, import("io-ts/es6").LiteralC<"http://www.w3.org/2001/XMLSchema#unsignedByte">]>;
export declare const integer: Type<TypedLiteral<integerDatatype>, TypedLiteral<integerDatatype>, RDF.Term>;
export declare type integerDatatype = keyof typeof integerRanges;
export declare const integerRanges: Readonly<{
    "http://www.w3.org/2001/XMLSchema#integer": [number, number];
    "http://www.w3.org/2001/XMLSchema#positiveInteger": [number, number];
    "http://www.w3.org/2001/XMLSchema#nonPositiveInteger": [number, number];
    "http://www.w3.org/2001/XMLSchema#negativeInteger": [number, number];
    "http://www.w3.org/2001/XMLSchema#nonNegativeInteger": [number, number];
    "http://www.w3.org/2001/XMLSchema#long": [number, number];
    "http://www.w3.org/2001/XMLSchema#int": [number, number];
    "http://www.w3.org/2001/XMLSchema#short": [number, number];
    "http://www.w3.org/2001/XMLSchema#byte": [number, number];
    "http://www.w3.org/2001/XMLSchema#unsignedLong": [number, number];
    "http://www.w3.org/2001/XMLSchema#unsignedInt": [number, number];
    "http://www.w3.org/2001/XMLSchema#unsignedShort": [number, number];
    "http://www.w3.org/2001/XMLSchema#unsignedByte": [number, number];
}>;
export declare const isInteger: (input: unknown) => input is TypedLiteral<"http://www.w3.org/2001/XMLSchema#integer" | "http://www.w3.org/2001/XMLSchema#positiveInteger" | "http://www.w3.org/2001/XMLSchema#nonPositiveInteger" | "http://www.w3.org/2001/XMLSchema#negativeInteger" | "http://www.w3.org/2001/XMLSchema#nonNegativeInteger" | "http://www.w3.org/2001/XMLSchema#long" | "http://www.w3.org/2001/XMLSchema#int" | "http://www.w3.org/2001/XMLSchema#short" | "http://www.w3.org/2001/XMLSchema#byte" | "http://www.w3.org/2001/XMLSchema#unsignedLong" | "http://www.w3.org/2001/XMLSchema#unsignedInt" | "http://www.w3.org/2001/XMLSchema#unsignedShort" | "http://www.w3.org/2001/XMLSchema#unsignedByte">;
export declare const encodeInteger: ({ value, }: TypedLiteral<"http://www.w3.org/2001/XMLSchema#integer" | "http://www.w3.org/2001/XMLSchema#positiveInteger" | "http://www.w3.org/2001/XMLSchema#nonPositiveInteger" | "http://www.w3.org/2001/XMLSchema#negativeInteger" | "http://www.w3.org/2001/XMLSchema#nonNegativeInteger" | "http://www.w3.org/2001/XMLSchema#long" | "http://www.w3.org/2001/XMLSchema#int" | "http://www.w3.org/2001/XMLSchema#short" | "http://www.w3.org/2001/XMLSchema#byte" | "http://www.w3.org/2001/XMLSchema#unsignedLong" | "http://www.w3.org/2001/XMLSchema#unsignedInt" | "http://www.w3.org/2001/XMLSchema#unsignedShort" | "http://www.w3.org/2001/XMLSchema#unsignedByte">) => number;
export declare const decimal: Type<TypedLiteral<"http://www.w3.org/2001/XMLSchema#decimal">, TypedLiteral<"http://www.w3.org/2001/XMLSchema#decimal">, RDF.Term>;
export declare type decimalDatatype = typeof xsd.decimal;
export declare const isDecimal: (input: unknown) => input is TypedLiteral<"http://www.w3.org/2001/XMLSchema#decimal">;
export declare const encodeDecimal: ({ value, }: TypedLiteral<"http://www.w3.org/2001/XMLSchema#decimal">) => number;
export declare type floatDatatype = typeof xsd.float;
export declare const float: Type<TypedLiteral<"http://www.w3.org/2001/XMLSchema#float">, TypedLiteral<"http://www.w3.org/2001/XMLSchema#float">, RDF.Term>;
export declare const isFloat: (input: unknown) => input is TypedLiteral<"http://www.w3.org/2001/XMLSchema#float">;
export declare const encodeFloat: ({ value }: TypedLiteral<"http://www.w3.org/2001/XMLSchema#float">) => number;
export declare type doubleDatatype = typeof xsd.double;
export declare const double: Type<TypedLiteral<"http://www.w3.org/2001/XMLSchema#double">, TypedLiteral<"http://www.w3.org/2001/XMLSchema#double">, RDF.Term>;
export declare const isDouble: (input: unknown) => input is TypedLiteral<"http://www.w3.org/2001/XMLSchema#double">;
export declare const encodeDouble: ({ value }: TypedLiteral<"http://www.w3.org/2001/XMLSchema#double">) => number;
export default function nodeSatisfies(node: RDF.Term, constraint: ShExParser.NodeConstraint): boolean;
export {};
