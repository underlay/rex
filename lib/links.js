export function getLinkMapClosure(linkMap) {
    const linkMapClosure = new Map();
    for (const [id, links] of linkMap.entries()) {
        const closure = new Set();
        for (const link of links) {
            addLink(link, closure, linkMap);
        }
        linkMapClosure.set(id, closure);
    }
    return linkMapClosure;
}
function addLink(a, closure, linkMap) {
    if (!closure.has(a)) {
        closure.add(a);
        for (const b of linkMap.get(a)) {
            addLink(b, closure, linkMap);
        }
    }
}
export function getLinkMap(schema) {
    const linkMap = new Map();
    for (const shape of schema.shapes || []) {
        const links = new Set();
        getShapeLinks(shape, links);
        linkMap.set(shape.id, links);
    }
    return linkMap;
}
function getShapeLinks(shape, links) {
    if (shape.type === "ShapeAnd") {
        for (const [i, shapeExpr] of shape.shapeExprs.entries()) {
            if (typeof shapeExpr === "string") {
                links.add(shapeExpr);
            }
            else {
                getShapeLinks(shapeExpr, links);
            }
        }
    }
    else if (shape.type === "ShapeOr") {
        for (const shapeExpr of shape.shapeExprs) {
            if (typeof shapeExpr === "string") {
                links.add(shapeExpr);
            }
            else {
                getShapeLinks(shapeExpr, links);
            }
        }
    }
    else if (shape.type === "Shape") {
        if (typeof shape.expression === "string") {
            links.add(shape.expression);
        }
        else if (shape.expression) {
            getExpressionLinks(shape.expression, links);
        }
    }
}
function getExpressionLinks(expression, links) {
    if (expression.type === "EachOf") {
        for (const tripleExpr of expression.expressions) {
            if (typeof tripleExpr !== "string") {
                getExpressionLinks(tripleExpr, links);
            }
        }
    }
    else if (expression.type === "OneOf") {
        for (const tripleExpr of expression.expressions) {
            if (typeof tripleExpr !== "string") {
                getExpressionLinks(tripleExpr, links);
            }
        }
    }
    else if (expression.type === "TripleConstraint") {
        if (typeof expression.valueExpr === "string") {
            links.add(expression.valueExpr);
        }
        else if (expression.valueExpr) {
            getShapeLinks(expression.valueExpr, links);
        }
    }
}
//# sourceMappingURL=links.js.map