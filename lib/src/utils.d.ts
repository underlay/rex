import { Term, BlankNode, D } from "n3.ts";
import { State } from "./state.js";
export declare const fromId: (id: string) => import("n3.ts").NamedNode | import("n3.ts").Literal | BlankNode | import("n3.ts").Variable | import("n3.ts").DefaultGraph;
export declare const toId: (term: Term<import("n3.ts").Terms<{
    termType: "NamedNode";
    value: string;
}, {
    termType: "BlankNode";
    value: string;
}, import("n3.ts").TermT<"Literal">, {
    termType: "DefaultGraph";
    value: "";
}, {
    termType: "Variable";
    value: string;
}>>) => string;
export declare function image<T extends Term<D>>(term: Exclude<T, BlankNode> | BlankNode, state: State): T | BlankNode;
export declare function preImage<T extends Term<D>>(term: Exclude<T, BlankNode> | BlankNode, state: State): Generator<T | BlankNode, void, undefined>;
export declare const getRange: (min: number | undefined, max: number | undefined) => {
    min: number;
    max: number;
};
