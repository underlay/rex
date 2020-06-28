import RDF from "rdf-js";
import { Shape, ShapeAnd, AnnotatedTripleConstraint } from "./schema.js";
import { State, Tree, Node } from "./state.js";
export declare function matchTripleConstraint(subject: RDF.Quad_Subject, { predicate, valueExpr }: AnnotatedTripleConstraint, state: State): Generator<Node, void, undefined>;
export declare function matchShape(subject: RDF.Quad_Subject, shapeExpr: Shape | ShapeAnd, state: State): Readonly<Tree> | null;
export declare function image<T extends RDF.Term>(term: Exclude<T, RDF.BlankNode> | RDF.BlankNode, state: State): T | RDF.BlankNode;
export declare function preImage<T extends RDF.NamedNode | RDF.Variable | RDF.Literal>(term: T | RDF.BlankNode, state: State): Generator<T | RDF.BlankNode, void, undefined>;
export declare const getRange: (min: number | undefined, max: number | undefined) => {
    min: number;
    max: number;
};
