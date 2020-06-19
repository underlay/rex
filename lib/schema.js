import { Type, type, partial, string, number, literal, array, union, intersection, recursion, tuple, failure, identity, brand, } from "io-ts/es6/index.js";
import { xsdDecimal, xsdFloat, xsdDouble, integerDatatype, } from "./satisfies.js";
import { NodeConstraint, dataTypeConstraint } from "./constraint.js";
import { rdfType, rex, xsdDateTime, xsdDate, xsdBoolean } from "./vocab.js";
export const lexicographic = union([
    literal(rex.ascending),
    literal(rex.descending),
]);
window.lexicographic = lexicographic;
export const numeric = union([literal(rex.greater), literal(rex.lesser)]);
export const temporal = union([literal(rex.earlier), literal(rex.later)]);
export const boolean = union([literal(rex.and), literal(rex.or)]);
const sortAnnotation = (object) => type({
    type: literal("Annotation"),
    predicate: literal(rex.sort),
    object,
});
const keyAnnotation = type({
    type: literal("Annotation"),
    predicate: literal(rex.key),
    object: string,
});
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
export function isNumeric(tripleConstraint) {
    if (tripleConstraint.annotations === undefined) {
        return false;
    }
    else {
        const [{ object }] = tripleConstraint.annotations;
        return numeric.is(object);
    }
}
export function isTemporal(tripleConstraint) {
    if (tripleConstraint.annotations === undefined) {
        return false;
    }
    else {
        const [{ object }] = tripleConstraint.annotations;
        return temporal.is(object);
    }
}
export function isBoolean(tripleConstraint) {
    if (tripleConstraint.annotations === undefined) {
        return false;
    }
    else {
        const [{ object }] = tripleConstraint.annotations;
        return boolean.is(object);
    }
}
export function isSortAnnotation(tripleConstraint) {
    if (tripleConstraint.annotations === undefined) {
        return false;
    }
    const [{ object }] = tripleConstraint.annotations;
    return !lexicographic.is(object);
}
const lexicographicAnnotation = tuple([sortAnnotation(lexicographic)]);
const TripleConstraint = recursion("TripleConstraint", () => intersection([
    type({
        type: literal("TripleConstraint"),
        predicate: string,
    }),
    partial({
        inverse: literal(false),
        min: number,
        max: number,
    }),
    union([
        type({
            valueExpr: dataTypeConstraint(union([
                literal(xsdDouble),
                literal(xsdDecimal),
                literal(xsdFloat),
                integerDatatype,
            ])),
            annotations: tuple([sortAnnotation(numeric)]),
        }),
        type({
            valueExpr: dataTypeConstraint(union([literal(xsdDate), literal(xsdDateTime)])),
            annotations: tuple([sortAnnotation(temporal)]),
        }),
        type({
            valueExpr: dataTypeConstraint(literal(xsdBoolean)),
            annotations: tuple([sortAnnotation(boolean)]),
        }),
        partial({
            valueExpr: valueExpr,
            annotations: lexicographicAnnotation,
        }),
    ]),
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
const emptyProductShape = type({
    type: literal("Shape"),
    expression: typedTripleConstraint,
});
const productShape = intersection([
    type({
        type: literal("Shape"),
        expression: type({
            type: literal("EachOf"),
            expressions: TypedTripleConstraints,
        }),
    }),
    partial({ annotations: tuple([keyAnnotation]) }),
]);
const product = union([emptyProductShape, productShape]);
export const isEmptyProductShape = (shape) => shape.expression.type === "TripleConstraint";
const schema = type({
    type: literal("Schema"),
    shapes: array(type({
        type: literal("ShapeAnd"),
        id: string,
        shapeExprs: tuple([
            type({
                type: literal("NodeConstraint"),
                nodeKind: literal("bnode"),
            }),
            product,
        ]),
    })),
});
export const Schema = brand(schema, (s) => s.shapes.every(({ shapeExprs: [_, shape] }) => isEmptyProductShape(shape) ||
    shape.annotations === undefined ||
    shape.expression.expressions.some(({ predicate }) => predicate === shape.annotations[0].object)), "KeyedSchema");
export function getExpressions(shape) {
    if (shape.expression.type === "EachOf") {
        return shape.expression.expressions;
    }
    else {
        return [shape.expression];
    }
}
//# sourceMappingURL=schema.js.map