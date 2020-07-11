import { Type, type, partial, string, number, literal, array, union, intersection, tuple, failure, identity, brand, success, } from "io-ts/es6/index.js";
import { rdf, rex, xsd } from "./vocab.js";
import { integerDatatype } from "./satisfies.js";
import { NodeConstraint, dataTypeConstraint } from "./constraint.js";
export const lexicographic = union([literal(rex.first), literal(rex.last)]), numeric = union([literal(rex.greatest), literal(rex.least)]), temporal = union([literal(rex.earliest), literal(rex.latest)]), boolean = union([literal(rex.all), literal(rex.any)]);
const annotation = (predicate, object) => type({ type: literal("Annotation"), predicate, object });
const metaAnnotation = annotation(literal(rex.meta), string);
const withAnnotation = annotation(literal(rex.with), string);
const keyAnnotation = annotation(literal(rex.key), string);
const inAnnotation = annotation(literal(rex.in), string);
const sortAnnotation = annotation(literal(rex.sort), union([numeric, temporal, boolean, lexicographic]));
export const shapeExpr = union([string, NodeConstraint]);
export const isDataTypeConstraint = (valueExpr) => typeof valueExpr !== "string" && valueExpr.hasOwnProperty("datatype");
export function isNumeric(tripleConstraint) {
    if (tripleConstraint.annotations === undefined) {
        return false;
    }
    const [{ predicate, object }] = tripleConstraint.annotations;
    return predicate === rex.sort && numeric.is(object);
}
export function isTemporal(tripleConstraint) {
    if (tripleConstraint.annotations === undefined) {
        return false;
    }
    const [{ predicate, object }] = tripleConstraint.annotations;
    return predicate === rex.sort && temporal.is(object);
}
export function isBoolean(tripleConstraint) {
    if (tripleConstraint.annotations === undefined) {
        return false;
    }
    const [{ predicate, object }] = tripleConstraint.annotations;
    return predicate === rex.sort && boolean.is(object);
}
export function isDatatypeAnnotation(tripleConstraint) {
    if (tripleConstraint.annotations === undefined) {
        return false;
    }
    const [{ predicate, object }] = tripleConstraint.annotations;
    return (predicate === rex.sort &&
        (numeric.is(object) || temporal.is(object) || boolean.is(object)));
}
export const isReferenceAnnotation = (tripleConstraint) => tripleConstraint.annotations !== undefined &&
    tripleConstraint.annotations.length > 1 &&
    tripleConstraint.annotations[0].predicate === rex.with &&
    tripleConstraint.annotations[1].predicate === rex.sort;
export const isMetaReferenceAnnotation = (tripleConstraint) => tripleConstraint.annotations !== undefined &&
    tripleConstraint.annotations.length > 2 &&
    tripleConstraint.annotations[0].predicate === rex.meta &&
    tripleConstraint.annotations[1].predicate === rex.sort &&
    tripleConstraint.annotations[2].predicate === rex.in;
const lexicographicAnnotation = annotation(literal(rex.sort), lexicographic), numericAnnotation = annotation(literal(rex.sort), numeric), temporalAnnotation = annotation(literal(rex.sort), temporal), booleanAnnotation = annotation(literal(rex.sort), boolean);
const wrap = (s) => union([tuple([s]), tuple([s, inAnnotation])]);
export const numericValueExpr = dataTypeConstraint(union([
    literal(xsd.double),
    literal(xsd.decimal),
    literal(xsd.float),
    integerDatatype,
])), temporalValueExpr = dataTypeConstraint(union([literal(xsd.date), literal(xsd.dateTime)])), booleanValueExpr = dataTypeConstraint(literal(xsd.boolean));
const tripleConstraint = intersection([
    type({
        type: literal("TripleConstraint"),
        predicate: string,
        valueExpr: shapeExpr,
    }),
    partial({
        inverse: literal(false),
        min: number,
        max: number,
        annotations: array(annotation(string, string)),
    }),
]);
const TripleConstraint = new Type("AnnotatedTripleConstraint", (input) => {
    if (!tripleConstraint.is(input)) {
        return false;
    }
    return true;
}, (input, context) => {
    if (tripleConstraint.is(input)) {
        if (input.annotations !== undefined) {
            const predicates = input.annotations.map(({ predicate }) => predicate);
            const [a, b, c] = input.annotations;
            if (a.predicate === rex.in) {
                if (input.annotations.length > 1) {
                    const extra = predicates.slice(1).join(", ");
                    return failure(input, context, `Extraneous annotations ${extra}`);
                }
            }
            else if (a.predicate === rex.sort) {
                if (!matchesSort(input.valueExpr, a.object)) {
                    return failure(input, context, `Sort annotation ${a.object} does not apply to the given value expression`);
                }
                else if (b !== undefined && b.predicate !== rex.in) {
                    const extra = predicates.slice(1).join(", ");
                    return failure(input, context, `Extraneous annotations ${extra}`);
                }
                else if (c !== undefined) {
                    const extra = predicates.slice(2).join(", ");
                    return failure(input, context, `Extraneous annotations ${extra}`);
                }
            }
            else if (a.predicate === rex.with) {
                if (b === undefined || b.predicate !== rex.sort) {
                    return failure(input, context, `Sorting with rex:with requires an explicit rex:sort annotation`);
                }
                else if (c !== undefined && c.predicate !== rex.in) {
                    const extra = predicates.slice(2).join(", ");
                    return failure(input, context, `Extraneous annotations ${extra}`);
                }
            }
            else if (a.predicate === rex.meta) {
                if (b === undefined || b.predicate !== rex.sort) {
                    return failure(input, context, `Sorting with rex:meta requires an explicit rex:sort annotation`);
                }
                else if (c === undefined || c.predicate !== rex.in) {
                    return failure(input, context, `Sorting with rex:meta requires an explicit rex:in annotation`);
                }
            }
            else {
                const extra = predicates.join(", ");
                return failure(input, context, `Extraneous annotations ${extra}`);
            }
        }
        return success(input);
    }
    else {
        return failure(input, context, "Invalid TripleConstraint");
    }
}, identity);
// const TripleConstraint: Type<AnnotatedTripleConstraint> = intersection([
// 	type({
// 		type: literal("TripleConstraint"),
// 		predicate: string,
// 		valueExpr: shapeExpr,
// 	}),
// 	partial({
// 		inverse: literal(false),
// 		min: number,
// 		max: number,
// 	}),
// 	union([
// 		type({
// 			annotations: union([
// 				tuple([withAnnotation, sortAnnotation]),
// 				tuple([withAnnotation, sortAnnotation, inAnnotation]),
// 			]),
// 		}),
// 		type({
// 			annotations: tuple([metaAnnotation, sortAnnotation, inAnnotation]),
// 		}),
// 		type({
// 			valueExpr: numericValueExpr,
// 			annotations: wrap(numericAnnotation),
// 		}),
// 		type({
// 			valueExpr: temporalValueExpr,
// 			annotations: wrap(temporalAnnotation),
// 		}),
// 		type({
// 			valueExpr: booleanValueExpr,
// 			annotations: wrap(booleanAnnotation),
// 		}),
// 		partial({
// 			annotations: wrap(lexicographicAnnotation),
// 		}),
// 	]),
// ])
const tripleConstraints = array(TripleConstraint);
const typedTripleConstraint = type({
    type: literal("TripleConstraint"),
    predicate: literal(rdf.type),
    valueExpr: type({
        type: literal("NodeConstraint"),
        values: tuple([string]),
    }),
});
const TypedTripleConstraints = new Type("TypedTripleConstraints", (input) => {
    if (!tripleConstraints.is(input) || input.length < 2) {
        return false;
    }
    if (!typedTripleConstraint.is(input[0])) {
        return false;
    }
    const predicates = new Set(input.map((c) => c.predicate));
    if (predicates.size !== input.length) {
        return false;
    }
    for (const tripleConstraint of input.slice(1)) {
        if (isReferenceAnnotation(tripleConstraint)) {
            const [{ object }] = tripleConstraint.annotations;
            if (object !== tripleConstraint.predicate) {
                const match = input.find(({ predicate }) => predicate === object);
                if (match === undefined || typeof match.valueExpr === "string") {
                    return false;
                }
            }
        }
    }
    return true;
}, (input, context) => {
    const result = tripleConstraints.validate(input, context);
    if (result._tag === "Left") {
        return result;
    }
    const [one] = result.right;
    const typed = typedTripleConstraint.validate(one, context);
    if (typed._tag === "Left") {
        return failure(input, context, "The first field of a shape must have predicate rdf:type and have a fixed single value");
    }
    const predicates = new Set(result.right.map((c) => c.predicate));
    if (predicates.size !== result.right.length) {
        return failure(input, context, "No two fields in the same shape can have the same predicate");
    }
    for (const tripleConstraint of result.right) {
        if (isReferenceAnnotation(tripleConstraint)) {
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
}, identity);
const emptyProductShape = type({
    type: literal("Shape"),
    expression: typedTripleConstraint,
});
const productShape = type({
    type: literal("Shape"),
    expression: type({
        type: literal("EachOf"),
        expressions: TypedTripleConstraints,
    }),
});
export const product = union([
    emptyProductShape,
    intersection([
        productShape,
        partial({ annotations: tuple([keyAnnotation]) }),
    ]),
]);
// export const product = intersection([
// 	union([emptyProductShape, productShape]),
// 	partial({ annotations: tuple([keyAnnotation]) }),
// ])
export const isEmptyProductShape = (shape) => shape.expression.type === "TripleConstraint";
const shapeAnd = type({
    type: literal("ShapeAnd"),
    id: string,
    shapeExprs: tuple([
        type({
            type: literal("NodeConstraint"),
            nodeKind: literal("bnode"),
        }),
        product,
    ]),
});
const schema = type({
    type: literal("Schema"),
    shapes: array(shapeAnd),
});
export const Schema = brand(schema, (s) => {
    for (const { shapeExprs: [_, shape], } of s.shapes) {
        if (isEmptyProductShape(shape) || shape.annotations === undefined) {
            continue;
        }
        const { expressions } = shape.expression;
        const [{ object }] = shape.annotations;
        const key = expressions.find(({ predicate }) => predicate === object);
        if (key === undefined) {
            return false;
        }
        for (const tripleConstraint of expressions) {
            if (isReferenceAnnotation(tripleConstraint)) {
                const [{ object: ref }, { object: sort }, graph,] = tripleConstraint.annotations;
                const expression = expressions.find(({ predicate }) => ref === predicate);
                if (expression === undefined) {
                    return false;
                }
                else if (expression === tripleConstraint) {
                    return false;
                }
                else if (!matchesSort(expression.valueExpr, sort)) {
                    return false;
                }
                else if (!checkGraph(graph, s)) {
                    return false;
                }
            }
            else if (isMetaReferenceAnnotation(tripleConstraint)) {
                const [{ object: meta }, { object: sort }, { object: graph },] = tripleConstraint.annotations;
                const match = s.shapes.find(({ id }) => id === graph);
                if (match === undefined) {
                    return false;
                }
                const [_, shape] = match.shapeExprs;
                const expression = getExpressions(shape).find(({ predicate }) => predicate === meta);
                if (expression === undefined) {
                    return false;
                }
                else if (typeof expression.valueExpr === "string" ||
                    !matchesSort(expression.valueExpr, sort)) {
                    return false;
                }
            }
        }
    }
    return true;
}, "Keyed");
function matchesSort(valueExpr, sort) {
    if (numeric.is(sort)) {
        return numericValueExpr.is(valueExpr);
    }
    else if (temporal.is(sort)) {
        return temporalValueExpr.is(valueExpr);
    }
    else if (boolean.is(sort)) {
        return booleanValueExpr.is(valueExpr);
    }
    else if (lexicographic.is(sort)) {
        return typeof valueExpr !== "string";
    }
    else {
        return false;
    }
}
const checkGraph = (graph, s) => graph === undefined || s.shapes.some(({ id }) => id === graph.object);
export const getExpressions = (shape) => shape.expression.type === "EachOf"
    ? shape.expression.expressions
    : [shape.expression];
//# sourceMappingURL=schema.js.map