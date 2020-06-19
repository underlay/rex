import RDF from "rdf-js";
import { Shape, ShapeAnd } from "./schema.js";
import { State, Tree } from "./state.js";
export declare function matchShape(subject: RDF.Quad_Subject, shapeExpr: Shape | ShapeAnd, state: State): Generator<Readonly<Tree>, void, undefined>;
