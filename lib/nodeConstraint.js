import { type, partial, string, number, literal, array, union, intersection, } from "io-ts/es6/index.js";
export const ObjectLiteral = intersection([
    type({ value: string }),
    partial({ language: string, type: string }),
]);
export const objectValue = union([string, ObjectLiteral]);
export const Wildcard = type({ type: literal("Wildcard") });
export const IriStem = type({ type: literal("IriStem"), stem: string });
export const IriStemRange = type({
    type: literal("IriStemRange"),
    stem: union([string, Wildcard]),
    exclusions: array(union([string, IriStem])),
});
export const LiteralStem = type({
    type: literal("LiteralStem"),
    stem: string,
});
export const LiteralStemRange = type({
    type: literal("LiteralStemRange"),
    stem: union([string, Wildcard]),
    exclusions: array(union([string, LiteralStem])),
});
export const Language = type({
    type: literal("Language"),
    languageTag: string,
});
export const LanguageStem = type({
    type: literal("LanguageStem"),
    stem: string,
});
export const LanguageStemRange = type({
    type: literal("LanguageStemRange"),
    stem: union([string, Wildcard]),
    exclusions: array(union([string, LanguageStem])),
});
export const valueSetValue = union([
    objectValue,
    IriStem,
    IriStemRange,
    LiteralStem,
    LiteralStemRange,
    Language,
    LanguageStem,
    LanguageStemRange,
]);
export const lengthFacet = partial({ length: number });
export const lengthRangeFacet = partial({
    minlength: number,
    maxlength: number,
});
export const patternFacet = intersection([
    partial({ pattern: string }),
    partial({ flags: string }),
]);
export const stringFacet = intersection([
    lengthFacet,
    lengthRangeFacet,
    patternFacet,
]);
export const numericFacet = partial({
    mininclusive: number,
    minexclusive: number,
    maxinclusive: number,
    maxexclusive: number,
    totaldigits: number,
    fractiondigits: number,
});
export const xsFacet = intersection([stringFacet, numericFacet]);
export const iriNodeKind = intersection([
    type({ nodeKind: literal("iri") }),
    stringFacet,
]);
export const nonLiteralNodeKind = type({
    nodeKind: union([literal("bnode"), literal("nonliteral")]),
});
export const literalNodeKind = intersection([
    type({ nodeKind: literal("literal") }),
    xsFacet,
]);
// export const dataType = type({ datatype: string })
export const dataType = intersection([type({ datatype: string }), xsFacet]);
export const valueSet = intersection([
    type({ values: array(valueSetValue) }),
    xsFacet,
]);
export const NodeConstraint = intersection([
    type({ type: literal("NodeConstraint") }),
    union([
        iriNodeKind,
        nonLiteralNodeKind,
        literalNodeKind,
        dataType,
        valueSet,
        stringFacet,
        numericFacet,
    ]),
]);
//# sourceMappingURL=nodeConstraint.js.map