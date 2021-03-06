import t from "./io.js";
import { rex, xsd } from "./vocab.js";
import { integerDatatype } from "./satisfies.js";
import { NodeConstraint, dataTypeConstraint } from "./constraint.js";
export const lexicographic = t.union([
    t.literal(rex.first),
    t.literal(rex.last),
]), numeric = t.union([t.literal(rex.greatest), t.literal(rex.least)]), temporal = t.union([t.literal(rex.earliest), t.literal(rex.latest)]), boolean = t.union([t.literal(rex.all), t.literal(rex.any)]);
const annotation = (predicate, object) => t.type({ type: t.literal("Annotation"), predicate, object });
const keyAnnotation = annotation(t.literal(rex.key), t.string);
const sortAnnotation = annotation(t.literal(rex.sort), t.union([numeric, temporal, boolean, lexicographic]));
export const shapeExpr = t.union([t.string, NodeConstraint]);
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
export const numericValueExpr = dataTypeConstraint(t.union([
    t.literal(xsd.double),
    t.literal(xsd.decimal),
    t.literal(xsd.float),
    integerDatatype,
])), temporalValueExpr = dataTypeConstraint(t.union([t.literal(xsd.date), t.literal(xsd.dateTime)])), booleanValueExpr = dataTypeConstraint(t.literal(xsd.boolean));
const tripleConstraint = t.intersection([
    t.type({
        type: t.literal("TripleConstraint"),
        predicate: t.string,
        valueExpr: shapeExpr,
    }),
    t.partial({
        inverse: t.literal(false),
        min: t.number,
        max: t.number,
        annotations: t.array(annotation(t.string, t.string)),
    }),
]);
const TripleConstraint = new t.Type("AnnotatedTripleConstraint", (input) => {
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
                    return t.failure(input, context, `Extraneous annotations ${extra}`);
                }
            }
            else if (a.predicate === rex.sort) {
                if (!matchesSort(input.valueExpr, a.object)) {
                    return t.failure(input, context, `Sort annotation ${a.object} does not apply to the given value expression`);
                }
                else if (b !== undefined && b.predicate !== rex.in) {
                    const extra = predicates.slice(1).join(", ");
                    return t.failure(input, context, `Extraneous annotations ${extra}`);
                }
                else if (c !== undefined) {
                    const extra = predicates.slice(2).join(", ");
                    return t.failure(input, context, `Extraneous annotations ${extra}`);
                }
            }
            else if (a.predicate === rex.with) {
                if (b === undefined || b.predicate !== rex.sort) {
                    return t.failure(input, context, `Sorting with rex:with requires an explicit rex:sort annotation`);
                }
                else if (c !== undefined && c.predicate !== rex.in) {
                    const extra = predicates.slice(2).join(", ");
                    return t.failure(input, context, `Extraneous annotations ${extra}`);
                }
            }
            else if (a.predicate === rex.meta) {
                if (b === undefined || b.predicate !== rex.sort) {
                    return t.failure(input, context, `Sorting with rex:meta requires an explicit rex:sort annotation`);
                }
                else if (c === undefined || c.predicate !== rex.in) {
                    return t.failure(input, context, `Sorting with rex:meta requires an explicit rex:in annotation`);
                }
            }
            else {
                const extra = predicates.join(", ");
                return t.failure(input, context, `Extraneous annotations ${extra}`);
            }
        }
        return t.success(input);
    }
    else {
        return t.failure(input, context, "Invalid TripleConstraint");
    }
}, t.identity);
const tripleConstraints = t.array(TripleConstraint);
const TripleConstraints = new t.Type("TripleConstraints", (input) => {
    if (!tripleConstraints.is(input) || input.length < 2) {
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
    const predicates = new Set(result.right.map((c) => c.predicate));
    if (predicates.size !== result.right.length) {
        return t.failure(input, context, "No two fields in the same shape can have the same predicate");
    }
    for (const tripleConstraint of result.right) {
        if (isReferenceAnnotation(tripleConstraint)) {
            const [{ object }] = tripleConstraint.annotations;
            if (object !== tripleConstraint.predicate) {
                const match = result.right.find(({ predicate }) => predicate === object);
                if (match === undefined) {
                    return t.failure(input, context);
                }
            }
        }
    }
    return result;
}, t.identity);
const shape = t.intersection([
    t.type({
        type: t.literal("Shape"),
        expression: t.union([
            TripleConstraint,
            t.type({
                type: t.literal("EachOf"),
                expressions: TripleConstraints,
            }),
        ]),
    }),
    t.partial({ annotations: t.tuple([keyAnnotation]) }),
]);
const shapeAnd = t.type({
    type: t.literal("ShapeAnd"),
    id: t.string,
    shapeExprs: t.tuple([
        t.type({
            type: t.literal("NodeConstraint"),
            nodeKind: t.literal("bnode"),
        }),
        shape,
    ]),
});
const schema = t.type({
    type: t.literal("Schema"),
    shapes: t.array(shapeAnd),
});
function validateSchema(s, context) {
    const linkMap = new Map();
    for (const { id, shapeExprs: [_, shape], } of s.shapes) {
        const expressions = getExpressions(shape);
        const links = new Set();
        for (const annotation of shape.annotations || []) {
            const expression = expressions.find(({ predicate }) => predicate === annotation.object);
            if (expression === undefined) {
                return t.failure(annotation, context, "Invalid rex:key annotation");
            }
            if (expression.annotations !== undefined) {
                const last = expression.annotations[expression.annotations.length - 1];
                if (last.predicate === rex.in) {
                    links.add(last.object);
                }
            }
        }
        linkMap.set(id, links);
        for (const tripleConstraint of expressions) {
            if (isReferenceAnnotation(tripleConstraint)) {
                const [ref, sort, graph] = tripleConstraint.annotations;
                const expression = expressions.find(({ predicate }) => ref.object === predicate);
                if (expression === undefined) {
                    return t.failure(ref, context, "Invalid rex:ref annotation");
                }
                else if (expression === tripleConstraint) {
                    return t.failure(ref, context, "Circular rex:ref annotation");
                }
                else if (!matchesSort(expression.valueExpr, sort.object)) {
                    return t.failure(sort, context, "Sort annotation does not match the reference type");
                }
                else if (!checkGraph(graph, s)) {
                    return t.failure(graph, context, "Invalid rex:in annotation");
                }
            }
            else if (isMetaReferenceAnnotation(tripleConstraint)) {
                const [meta, sort, graph] = tripleConstraint.annotations;
                const match = s.shapes.find(({ id }) => id === graph.object);
                if (match === undefined) {
                    return t.failure(graph, context, "Invalid rex:in annotation");
                }
                const [_, shape] = match.shapeExprs;
                const expression = getExpressions(shape).find(({ predicate }) => predicate === meta.object);
                if (expression === undefined) {
                    return t.failure(meta, context, "Invalid rex:meta annotation");
                }
                else if (typeof expression.valueExpr === "string" ||
                    !matchesSort(expression.valueExpr, sort.object)) {
                    return t.failure(sort, context, "Sort annotation does not match the reference type");
                }
            }
        }
    }
    // Check for circular key links
    const path = findCycle(linkMap);
    if (path !== null) {
        return t.failure(s, context, `Circular key references: ${path.join(" -> ")}`);
    }
    return t.success(s);
}
export const Schema = new t.Type("Schema", (input) => {
    if (!schema.is(input)) {
        return false;
    }
    const either = validateSchema(input, []);
    return either._tag === "Right";
}, validateSchema, t.identity);
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
export const getExpressions = ({ expression, }) => (expression.type === "EachOf" ? expression.expressions : [expression]);
function findPath(source, target, map) {
    const links = map.get(source);
    if (links.has(target)) {
        return [source];
    }
    for (const link of links) {
        const path = findPath(link, target, map);
        if (path !== null) {
            path.splice(0, 0, source);
            return path;
        }
    }
    return null;
}
function findCycle(map) {
    for (const source of map.keys()) {
        const path = findPath(source, source, map);
        if (path !== null) {
            return path;
        }
    }
    return null;
}
//# sourceMappingURL=schema.js.map