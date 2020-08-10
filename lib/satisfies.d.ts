import { Term, Terms, NamedNodeT, TermT, LiteralT } from "n3.ts";
import t from "./io.js";
import * as ShExParser from "@shexjs/parser";
import { xsd } from "./vocab.js";
interface NamedNode<T extends string> extends TermT<NamedNodeT> {
    value: T;
}
export interface TypedLiteral<T extends string> extends TermT<LiteralT> {
    datatype: NamedNode<T>;
}
export declare const TypedLiteral: <T extends string>(value: t.Type<T, T, unknown>) => t.Type<TypedLiteral<T>, TypedLiteral<T>, Term<Terms<{
    termType: "NamedNode";
    value: string;
}, {
    termType: "BlankNode";
    value: string;
}, TermT<"Literal">, {
    termType: "DefaultGraph";
    value: "";
}, {
    termType: "Variable";
    value: string;
}>>>;
export declare const integerDatatype: t.UnionC<[t.LiteralC<"http://www.w3.org/2001/XMLSchema#integer">, t.LiteralC<"http://www.w3.org/2001/XMLSchema#positiveInteger">, t.LiteralC<"http://www.w3.org/2001/XMLSchema#nonPositiveInteger">, t.LiteralC<"http://www.w3.org/2001/XMLSchema#negativeInteger">, t.LiteralC<"http://www.w3.org/2001/XMLSchema#nonNegativeInteger">, t.LiteralC<"http://www.w3.org/2001/XMLSchema#long">, t.LiteralC<"http://www.w3.org/2001/XMLSchema#int">, t.LiteralC<"http://www.w3.org/2001/XMLSchema#short">, t.LiteralC<"http://www.w3.org/2001/XMLSchema#byte">, t.LiteralC<"http://www.w3.org/2001/XMLSchema#unsignedLong">, t.LiteralC<"http://www.w3.org/2001/XMLSchema#unsignedInt">, t.LiteralC<"http://www.w3.org/2001/XMLSchema#unsignedShort">, t.LiteralC<"http://www.w3.org/2001/XMLSchema#unsignedByte">]>;
export declare const integer: t.Type<TypedLiteral<integerDatatype>, TypedLiteral<integerDatatype>, Term>;
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
export declare const decimal: t.Type<TypedLiteral<"http://www.w3.org/2001/XMLSchema#decimal">, TypedLiteral<"http://www.w3.org/2001/XMLSchema#decimal">, Term<Terms<{
    termType: "NamedNode";
    value: string;
}, {
    termType: "BlankNode";
    value: string;
}, TermT<"Literal">, {
    termType: "DefaultGraph";
    value: "";
}, {
    termType: "Variable";
    value: string;
}>>>;
export declare type decimalDatatype = typeof xsd.decimal;
export declare const isDecimal: (input: unknown) => input is TypedLiteral<"http://www.w3.org/2001/XMLSchema#decimal">;
export declare const encodeDecimal: ({ value, }: TypedLiteral<"http://www.w3.org/2001/XMLSchema#decimal">) => number;
export declare type floatDatatype = typeof xsd.float;
export declare const float: t.Type<TypedLiteral<"http://www.w3.org/2001/XMLSchema#float">, TypedLiteral<"http://www.w3.org/2001/XMLSchema#float">, Term<Terms<{
    termType: "NamedNode";
    value: string;
}, {
    termType: "BlankNode";
    value: string;
}, TermT<"Literal">, {
    termType: "DefaultGraph";
    value: "";
}, {
    termType: "Variable";
    value: string;
}>>>;
export declare const isFloat: (input: unknown) => input is TypedLiteral<"http://www.w3.org/2001/XMLSchema#float">;
export declare const encodeFloat: ({ value }: TypedLiteral<"http://www.w3.org/2001/XMLSchema#float">) => number;
export declare type doubleDatatype = typeof xsd.double;
export declare const double: t.Type<TypedLiteral<"http://www.w3.org/2001/XMLSchema#double">, TypedLiteral<"http://www.w3.org/2001/XMLSchema#double">, Term<Terms<{
    termType: "NamedNode";
    value: string;
}, {
    termType: "BlankNode";
    value: string;
}, TermT<"Literal">, {
    termType: "DefaultGraph";
    value: "";
}, {
    termType: "Variable";
    value: string;
}>>>;
export declare const isDouble: (input: unknown) => input is TypedLiteral<"http://www.w3.org/2001/XMLSchema#double">;
export declare const encodeDouble: ({ value }: TypedLiteral<"http://www.w3.org/2001/XMLSchema#double">) => number;
export default function nodeSatisfies(node: Term, constraint: ShExParser.NodeConstraint): boolean;
export {};
