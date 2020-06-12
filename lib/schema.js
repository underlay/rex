import { Type, type, partial, string, number, literal, array, union, intersection, recursion, tuple, failure, identity, } from "io-ts/es6/index.js";
import { objectValue, NodeConstraint } from "./nodeConstraint.js";
import { rdfType } from "./utils.js";
const SemAct = intersection([
    type({ type: literal("SemAct"), name: string }),
    partial({ code: string }),
]);
const annotations = array(type({
    type: literal("Annotation"),
    predicate: string,
    object: objectValue,
}));
export const ShapeAnd = recursion("ShapeAnd", () => type({
    type: literal("ShapeAnd"),
    shapeExprs: tuple([NodeConstraint, Shape]),
}));
export const shapeExpr = recursion("shapeExpr", () => union([string, NodeConstraint, Shape, ShapeAnd]));
const valueExpr = recursion("valueExpr", () => union([
    shapeExpr,
    type({
        type: literal("ShapeOr"),
        shapeExprs: array(shapeExpr),
    }),
]));
const TripleConstraint = recursion("TripleConstraint", () => intersection([
    type({
        type: literal("TripleConstraint"),
        predicate: string,
    }),
    partial({
        valueExpr: valueExpr,
        inverse: literal(false),
        semActs: array(SemAct),
        annotations,
        min: number,
        max: number,
    }),
]));
const Shape = recursion("Shape", () => type({
    type: literal("Shape"),
    expression: union([TripleConstraint, EachOf]),
}));
const UniqueTripleConstraints = new Type("UniqueTripleConstraints", (input) => {
    if (array(TripleConstraint).is(input)) {
        if (input.length > 1) {
            const predicates = new Set(input.map((c) => c.predicate));
            return predicates.size === input.length;
        }
    }
    return false;
}, (input, context) => {
    const result = array(TripleConstraint).validate(input, context);
    if (result._tag === "Right" && result.right.length > 1) {
        const { size } = new Set(result.right.map((c) => c.predicate));
        if (size !== result.right.length) {
            return failure(input, context);
        }
        else {
            return result;
        }
    }
    return failure(input, context);
}, identity);
const EachOf = type({
    type: literal("EachOf"),
    expressions: UniqueTripleConstraints,
});
const typedTripleConstraint = type({
    type: literal("TripleConstraint"),
    predicate: literal(rdfType),
    valueExpr: type({
        type: literal("NodeConstraint"),
        values: tuple([string]),
    }),
});
const TypedTripleConstraints = new Type("TypedTripleConstraints", (input) => UniqueTripleConstraints.is(input) && typedTripleConstraint.is(input[0]), (input, context) => {
    const result = UniqueTripleConstraints.validate(input, context);
    if (result._tag === "Right") {
        const [one, two, ...rest] = result.right;
        const typed = typedTripleConstraint.validate(one, context);
        if (typed._tag === "Right") {
            return result;
        }
        else {
            return typed;
        }
    }
    else {
        return result;
    }
}, identity);
export const Schema = type({
    type: literal("Schema"),
    shapes: array(type({
        type: literal("ShapeAnd"),
        id: string,
        shapeExprs: tuple([
            type({
                type: literal("NodeConstraint"),
                nodeKind: literal("bnode"),
            }),
            intersection([
                type({
                    type: literal("Shape"),
                    expression: union([
                        typedTripleConstraint,
                        type({
                            type: literal("EachOf"),
                            expressions: TypedTripleConstraints,
                        }),
                    ]),
                }),
                partial({ annotations }),
            ]),
        ]),
    })),
});
export function getExpressions(shape) {
    if (shape.expression.type === "EachOf") {
        return shape.expression.expressions;
    }
    else {
        return [shape.expression];
    }
}
//# sourceMappingURL=schema.js.map