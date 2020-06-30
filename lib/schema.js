import { Type, type, partial, string, number, literal, array, union, intersection, recursion, tuple, failure, identity, brand, } from "io-ts/es6/index.js";
import { integerDatatype } from "./satisfies.js";
import { NodeConstraint, dataTypeConstraint } from "./constraint.js";
import { rdf, rex, xsd } from "./vocab.js";
export const lexicographic = union([literal(rex.first), literal(rex.last)]);
export const numeric = union([literal(rex.greatest), literal(rex.least)]);
export const temporal = union([literal(rex.earliest), literal(rex.latest)]);
export const boolean = union([literal(rex.all), literal(rex.any)]);
const annotation = (predicate, object) => type({ type: literal("Annotation"), predicate, object });
const metaAnnotation = annotation(literal(rex.meta), string);
const withAnnotation = annotation(literal(rex.with), string);
const keyAnnotation = annotation(literal(rex.key), string);
export const ShapeAnd = recursion("ShapeAnd", () => type({
    type: literal("ShapeAnd"),
    shapeExprs: tuple([NodeConstraint, Shape]),
}));
export const shapeExpr = recursion("shapeExpr", () => union([string, NodeConstraint, Shape, ShapeAnd]));
export function isNumeric(tripleConstraint) {
    if (tripleConstraint.annotations === undefined ||
        tripleConstraint.annotations.length !== 1) {
        return false;
    }
    else {
        const [{ object }] = tripleConstraint.annotations;
        return numeric.is(object);
    }
}
export function isTemporal(tripleConstraint) {
    if (tripleConstraint.annotations === undefined ||
        tripleConstraint.annotations.length !== 1) {
        return false;
    }
    else {
        const [{ object }] = tripleConstraint.annotations;
        return temporal.is(object);
    }
}
export function isBoolean(tripleConstraint) {
    if (tripleConstraint.annotations === undefined ||
        tripleConstraint.annotations.length !== 1) {
        return false;
    }
    else {
        const [{ object }] = tripleConstraint.annotations;
        return boolean.is(object);
    }
}
export function isDatatypeAnnotation(tripleConstraint) {
    if (tripleConstraint.annotations === undefined) {
        return false;
    }
    const [{ object }] = tripleConstraint.annotations;
    return numeric.is(object) || temporal.is(object) || boolean.is(object);
}
export function isWithAnnotation(tripleConstraint) {
    return (tripleConstraint.annotations !== undefined &&
        tripleConstraint.annotations.length === 1 &&
        tripleConstraint.annotations[0].predicate === rex.with);
}
export function isMetaAnnotation(tripleConstraint) {
    return (tripleConstraint.annotations !== undefined &&
        tripleConstraint.annotations[0].predicate === rex.meta);
}
const lexicographicAnnotation = annotation(literal(rex.sort), lexicographic), numericAnnotation = annotation(literal(rex.sort), numeric), temporalAnnotation = annotation(literal(rex.sort), temporal), booleanAnnotation = annotation(literal(rex.sort), boolean);
const TripleConstraint = recursion("TripleConstraint", () => intersection([
    type({
        type: literal("TripleConstraint"),
        predicate: string,
    }),
    partial({
        valueExpr: shapeExpr,
        inverse: literal(false),
        min: number,
        max: number,
    }),
    union([
        type({
            annotations: tuple([
                metaAnnotation,
                withAnnotation,
            ]),
        }),
        type({ annotations: tuple([metaAnnotation]) }),
        type({ annotations: tuple([withAnnotation]) }),
        type({
            valueExpr: dataTypeConstraint(union([
                literal(xsd.double),
                literal(xsd.decimal),
                literal(xsd.float),
                integerDatatype,
            ])),
            annotations: tuple([numericAnnotation]),
        }),
        type({
            valueExpr: dataTypeConstraint(union([literal(xsd.date), literal(xsd.dateTime)])),
            annotations: tuple([temporalAnnotation]),
        }),
        type({
            valueExpr: dataTypeConstraint(literal(xsd.boolean)),
            annotations: tuple([booleanAnnotation]),
        }),
        partial({
            annotations: tuple([lexicographicAnnotation]),
        }),
    ]),
]));
const Shape = recursion("Shape", () => type({
    type: literal("Shape"),
    expression: union([TripleConstraint, EachOf]),
}));
const tripleConstraints = array(TripleConstraint);
const UniqueTripleConstraints = new Type("UniqueTripleConstraints", (input) => {
    if (tripleConstraints.is(input) && input.length > 1) {
        const predicates = new Set(input.map((c) => c.predicate));
        return predicates.size === input.length;
    }
    return false;
}, (input, context) => {
    const result = tripleConstraints.validate(input, context);
    if (result._tag === "Right" && result.right.length > 1) {
        const { size } = new Set(result.right.map((c) => c.predicate));
        if (size === result.right.length) {
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
    predicate: literal(rdf.type),
    valueExpr: type({
        type: literal("NodeConstraint"),
        values: tuple([string]),
    }),
});
const TypedTripleConstraints = new Type("TypedTripleConstraints", (input) => {
    if (UniqueTripleConstraints.is(input) &&
        typedTripleConstraint.is(input[0])) {
        for (const tripleConstraint of input.slice(1)) {
            if (isWithAnnotation(tripleConstraint)) {
                const [{ object }] = tripleConstraint.annotations;
                if (object !== tripleConstraint.predicate) {
                    const match = input.find(({ predicate }) => predicate === object);
                    if (match === undefined) {
                        return false;
                    }
                }
            }
        }
        return true;
    }
    return false;
}, (input, context) => {
    const result = UniqueTripleConstraints.validate(input, context);
    if (result._tag === "Right") {
        const [one] = result.right;
        const typed = typedTripleConstraint.validate(one, context);
        if (typed._tag === "Right") {
            for (const tripleConstraint of result.right) {
                if (isWithAnnotation(tripleConstraint)) {
                    const [{ object }] = tripleConstraint.annotations;
                    if (object !== tripleConstraint.predicate) {
                        const match = result.right.find(({ predicate }) => predicate === object);
                        if (match === undefined) {
                            return failure(input, context);
                        }
                    }
                }
            }
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
export const Schema = brand(schema, (s) => {
    for (const { shapeExprs: [_, shape], } of s.shapes) {
        if (isEmptyProductShape(shape) || shape.annotations === undefined) {
            continue;
        }
        const [{ object }] = shape.annotations;
        const key = shape.expression.expressions.find(({ predicate }) => predicate === object);
        if (key === undefined) {
            return false;
        }
        for (const tripleConstraint of shape.expression.expressions) {
            const valid = checkMetaAnnotations(s, tripleConstraint);
            if (!valid) {
                return false;
            }
        }
    }
    return true;
}, "Keyed");
function checkMetaAnnotations(s, tripleConstraint) {
    if (isMetaAnnotation(tripleConstraint)) {
        const { valueExpr, annotations: [{ object }, withReference], } = tripleConstraint;
        const match = s.shapes.find(({ id }) => object === id);
        if (match === undefined) {
            return false;
        }
        if (withReference !== undefined) {
            const { shapeExprs: [_, { expression }], } = match;
            if (expression.type === "TripleConstraint") {
                return false;
            }
            const reference = expression.expressions.find(({ predicate }) => predicate === withReference.object);
            if (reference === undefined ||
                isWithAnnotation(reference) ||
                isMetaAnnotation(reference)) {
                return false;
            }
        }
        if (valueExpr !== undefined &&
            typeof valueExpr !== "string" &&
            valueExpr.type !== "NodeConstraint") {
            const [_, shape] = getShape(valueExpr);
            for (const expression of getExpressions(shape)) {
                checkMetaAnnotations(s, expression);
            }
        }
    }
    return true;
}
export function getExpressions(shape) {
    if (shape.expression.type === "EachOf") {
        return shape.expression.expressions;
    }
    else {
        return [shape.expression];
    }
}
export const getShape = (shape) => shape.type === "ShapeAnd" ? shape.shapeExprs : [null, shape];
//# sourceMappingURL=schema.js.map