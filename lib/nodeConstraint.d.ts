import { Type } from "io-ts/es6/index.js";
import ShExParser from "@shexjs/parser";
export declare const ObjectLiteral: import("io-ts/es6").IntersectionC<[import("io-ts/es6").TypeC<{
    value: import("io-ts/es6").StringC;
}>, import("io-ts/es6").PartialC<{
    language: import("io-ts/es6").StringC;
    type: import("io-ts/es6").StringC;
}>]>;
export declare const objectValue: import("io-ts/es6").UnionC<[import("io-ts/es6").StringC, import("io-ts/es6").IntersectionC<[import("io-ts/es6").TypeC<{
    value: import("io-ts/es6").StringC;
}>, import("io-ts/es6").PartialC<{
    language: import("io-ts/es6").StringC;
    type: import("io-ts/es6").StringC;
}>]>]>;
export declare const Wildcard: import("io-ts/es6").TypeC<{
    type: import("io-ts/es6").LiteralC<"Wildcard">;
}>;
export declare const IriStem: import("io-ts/es6").TypeC<{
    type: import("io-ts/es6").LiteralC<"IriStem">;
    stem: import("io-ts/es6").StringC;
}>;
export declare const IriStemRange: import("io-ts/es6").TypeC<{
    type: import("io-ts/es6").LiteralC<"IriStemRange">;
    stem: import("io-ts/es6").UnionC<[import("io-ts/es6").StringC, import("io-ts/es6").TypeC<{
        type: import("io-ts/es6").LiteralC<"Wildcard">;
    }>]>;
    exclusions: import("io-ts/es6").ArrayC<import("io-ts/es6").UnionC<[import("io-ts/es6").StringC, import("io-ts/es6").TypeC<{
        type: import("io-ts/es6").LiteralC<"IriStem">;
        stem: import("io-ts/es6").StringC;
    }>]>>;
}>;
export declare const LiteralStem: import("io-ts/es6").TypeC<{
    type: import("io-ts/es6").LiteralC<"LiteralStem">;
    stem: import("io-ts/es6").StringC;
}>;
export declare const LiteralStemRange: import("io-ts/es6").TypeC<{
    type: import("io-ts/es6").LiteralC<"LiteralStemRange">;
    stem: import("io-ts/es6").UnionC<[import("io-ts/es6").StringC, import("io-ts/es6").TypeC<{
        type: import("io-ts/es6").LiteralC<"Wildcard">;
    }>]>;
    exclusions: import("io-ts/es6").ArrayC<import("io-ts/es6").UnionC<[import("io-ts/es6").StringC, import("io-ts/es6").TypeC<{
        type: import("io-ts/es6").LiteralC<"LiteralStem">;
        stem: import("io-ts/es6").StringC;
    }>]>>;
}>;
export declare const Language: import("io-ts/es6").TypeC<{
    type: import("io-ts/es6").LiteralC<"Language">;
    languageTag: import("io-ts/es6").StringC;
}>;
export declare const LanguageStem: import("io-ts/es6").TypeC<{
    type: import("io-ts/es6").LiteralC<"LanguageStem">;
    stem: import("io-ts/es6").StringC;
}>;
export declare const LanguageStemRange: import("io-ts/es6").TypeC<{
    type: import("io-ts/es6").LiteralC<"LanguageStemRange">;
    stem: import("io-ts/es6").UnionC<[import("io-ts/es6").StringC, import("io-ts/es6").TypeC<{
        type: import("io-ts/es6").LiteralC<"Wildcard">;
    }>]>;
    exclusions: import("io-ts/es6").ArrayC<import("io-ts/es6").UnionC<[import("io-ts/es6").StringC, import("io-ts/es6").TypeC<{
        type: import("io-ts/es6").LiteralC<"LanguageStem">;
        stem: import("io-ts/es6").StringC;
    }>]>>;
}>;
export declare const valueSetValue: import("io-ts/es6").UnionC<[import("io-ts/es6").UnionC<[import("io-ts/es6").StringC, import("io-ts/es6").IntersectionC<[import("io-ts/es6").TypeC<{
    value: import("io-ts/es6").StringC;
}>, import("io-ts/es6").PartialC<{
    language: import("io-ts/es6").StringC;
    type: import("io-ts/es6").StringC;
}>]>]>, import("io-ts/es6").TypeC<{
    type: import("io-ts/es6").LiteralC<"IriStem">;
    stem: import("io-ts/es6").StringC;
}>, import("io-ts/es6").TypeC<{
    type: import("io-ts/es6").LiteralC<"IriStemRange">;
    stem: import("io-ts/es6").UnionC<[import("io-ts/es6").StringC, import("io-ts/es6").TypeC<{
        type: import("io-ts/es6").LiteralC<"Wildcard">;
    }>]>;
    exclusions: import("io-ts/es6").ArrayC<import("io-ts/es6").UnionC<[import("io-ts/es6").StringC, import("io-ts/es6").TypeC<{
        type: import("io-ts/es6").LiteralC<"IriStem">;
        stem: import("io-ts/es6").StringC;
    }>]>>;
}>, import("io-ts/es6").TypeC<{
    type: import("io-ts/es6").LiteralC<"LiteralStem">;
    stem: import("io-ts/es6").StringC;
}>, import("io-ts/es6").TypeC<{
    type: import("io-ts/es6").LiteralC<"LiteralStemRange">;
    stem: import("io-ts/es6").UnionC<[import("io-ts/es6").StringC, import("io-ts/es6").TypeC<{
        type: import("io-ts/es6").LiteralC<"Wildcard">;
    }>]>;
    exclusions: import("io-ts/es6").ArrayC<import("io-ts/es6").UnionC<[import("io-ts/es6").StringC, import("io-ts/es6").TypeC<{
        type: import("io-ts/es6").LiteralC<"LiteralStem">;
        stem: import("io-ts/es6").StringC;
    }>]>>;
}>, import("io-ts/es6").TypeC<{
    type: import("io-ts/es6").LiteralC<"Language">;
    languageTag: import("io-ts/es6").StringC;
}>, import("io-ts/es6").TypeC<{
    type: import("io-ts/es6").LiteralC<"LanguageStem">;
    stem: import("io-ts/es6").StringC;
}>, import("io-ts/es6").TypeC<{
    type: import("io-ts/es6").LiteralC<"LanguageStemRange">;
    stem: import("io-ts/es6").UnionC<[import("io-ts/es6").StringC, import("io-ts/es6").TypeC<{
        type: import("io-ts/es6").LiteralC<"Wildcard">;
    }>]>;
    exclusions: import("io-ts/es6").ArrayC<import("io-ts/es6").UnionC<[import("io-ts/es6").StringC, import("io-ts/es6").TypeC<{
        type: import("io-ts/es6").LiteralC<"LanguageStem">;
        stem: import("io-ts/es6").StringC;
    }>]>>;
}>]>;
export declare const lengthFacet: import("io-ts/es6").PartialC<{
    length: import("io-ts/es6").NumberC;
}>;
export declare const lengthRangeFacet: import("io-ts/es6").PartialC<{
    minlength: import("io-ts/es6").NumberC;
    maxlength: import("io-ts/es6").NumberC;
}>;
export declare const patternFacet: import("io-ts/es6").IntersectionC<[import("io-ts/es6").PartialC<{
    pattern: import("io-ts/es6").StringC;
}>, import("io-ts/es6").PartialC<{
    flags: import("io-ts/es6").StringC;
}>]>;
export declare const stringFacet: import("io-ts/es6").IntersectionC<[import("io-ts/es6").PartialC<{
    length: import("io-ts/es6").NumberC;
}>, import("io-ts/es6").PartialC<{
    minlength: import("io-ts/es6").NumberC;
    maxlength: import("io-ts/es6").NumberC;
}>, import("io-ts/es6").IntersectionC<[import("io-ts/es6").PartialC<{
    pattern: import("io-ts/es6").StringC;
}>, import("io-ts/es6").PartialC<{
    flags: import("io-ts/es6").StringC;
}>]>]>;
export declare const numericFacet: import("io-ts/es6").PartialC<{
    mininclusive: import("io-ts/es6").NumberC;
    minexclusive: import("io-ts/es6").NumberC;
    maxinclusive: import("io-ts/es6").NumberC;
    maxexclusive: import("io-ts/es6").NumberC;
    totaldigits: import("io-ts/es6").NumberC;
    fractiondigits: import("io-ts/es6").NumberC;
}>;
export declare const xsFacet: import("io-ts/es6").IntersectionC<[import("io-ts/es6").IntersectionC<[import("io-ts/es6").PartialC<{
    length: import("io-ts/es6").NumberC;
}>, import("io-ts/es6").PartialC<{
    minlength: import("io-ts/es6").NumberC;
    maxlength: import("io-ts/es6").NumberC;
}>, import("io-ts/es6").IntersectionC<[import("io-ts/es6").PartialC<{
    pattern: import("io-ts/es6").StringC;
}>, import("io-ts/es6").PartialC<{
    flags: import("io-ts/es6").StringC;
}>]>]>, import("io-ts/es6").PartialC<{
    mininclusive: import("io-ts/es6").NumberC;
    minexclusive: import("io-ts/es6").NumberC;
    maxinclusive: import("io-ts/es6").NumberC;
    maxexclusive: import("io-ts/es6").NumberC;
    totaldigits: import("io-ts/es6").NumberC;
    fractiondigits: import("io-ts/es6").NumberC;
}>]>;
export declare const iriNodeKind: import("io-ts/es6").IntersectionC<[import("io-ts/es6").TypeC<{
    nodeKind: import("io-ts/es6").LiteralC<"iri">;
}>, import("io-ts/es6").IntersectionC<[import("io-ts/es6").PartialC<{
    length: import("io-ts/es6").NumberC;
}>, import("io-ts/es6").PartialC<{
    minlength: import("io-ts/es6").NumberC;
    maxlength: import("io-ts/es6").NumberC;
}>, import("io-ts/es6").IntersectionC<[import("io-ts/es6").PartialC<{
    pattern: import("io-ts/es6").StringC;
}>, import("io-ts/es6").PartialC<{
    flags: import("io-ts/es6").StringC;
}>]>]>]>;
export declare const nonLiteralNodeKind: import("io-ts/es6").TypeC<{
    nodeKind: import("io-ts/es6").UnionC<[import("io-ts/es6").LiteralC<"bnode">, import("io-ts/es6").LiteralC<"nonliteral">]>;
}>;
export declare const literalNodeKind: import("io-ts/es6").IntersectionC<[import("io-ts/es6").TypeC<{
    nodeKind: import("io-ts/es6").LiteralC<"literal">;
}>, import("io-ts/es6").IntersectionC<[import("io-ts/es6").IntersectionC<[import("io-ts/es6").PartialC<{
    length: import("io-ts/es6").NumberC;
}>, import("io-ts/es6").PartialC<{
    minlength: import("io-ts/es6").NumberC;
    maxlength: import("io-ts/es6").NumberC;
}>, import("io-ts/es6").IntersectionC<[import("io-ts/es6").PartialC<{
    pattern: import("io-ts/es6").StringC;
}>, import("io-ts/es6").PartialC<{
    flags: import("io-ts/es6").StringC;
}>]>]>, import("io-ts/es6").PartialC<{
    mininclusive: import("io-ts/es6").NumberC;
    minexclusive: import("io-ts/es6").NumberC;
    maxinclusive: import("io-ts/es6").NumberC;
    maxexclusive: import("io-ts/es6").NumberC;
    totaldigits: import("io-ts/es6").NumberC;
    fractiondigits: import("io-ts/es6").NumberC;
}>]>]>;
export declare const dataType: import("io-ts/es6").IntersectionC<[import("io-ts/es6").TypeC<{
    datatype: import("io-ts/es6").StringC;
}>, import("io-ts/es6").IntersectionC<[import("io-ts/es6").IntersectionC<[import("io-ts/es6").PartialC<{
    length: import("io-ts/es6").NumberC;
}>, import("io-ts/es6").PartialC<{
    minlength: import("io-ts/es6").NumberC;
    maxlength: import("io-ts/es6").NumberC;
}>, import("io-ts/es6").IntersectionC<[import("io-ts/es6").PartialC<{
    pattern: import("io-ts/es6").StringC;
}>, import("io-ts/es6").PartialC<{
    flags: import("io-ts/es6").StringC;
}>]>]>, import("io-ts/es6").PartialC<{
    mininclusive: import("io-ts/es6").NumberC;
    minexclusive: import("io-ts/es6").NumberC;
    maxinclusive: import("io-ts/es6").NumberC;
    maxexclusive: import("io-ts/es6").NumberC;
    totaldigits: import("io-ts/es6").NumberC;
    fractiondigits: import("io-ts/es6").NumberC;
}>]>]>;
export declare const valueSet: import("io-ts/es6").IntersectionC<[import("io-ts/es6").TypeC<{
    values: import("io-ts/es6").ArrayC<import("io-ts/es6").UnionC<[import("io-ts/es6").UnionC<[import("io-ts/es6").StringC, import("io-ts/es6").IntersectionC<[import("io-ts/es6").TypeC<{
        value: import("io-ts/es6").StringC;
    }>, import("io-ts/es6").PartialC<{
        language: import("io-ts/es6").StringC;
        type: import("io-ts/es6").StringC;
    }>]>]>, import("io-ts/es6").TypeC<{
        type: import("io-ts/es6").LiteralC<"IriStem">;
        stem: import("io-ts/es6").StringC;
    }>, import("io-ts/es6").TypeC<{
        type: import("io-ts/es6").LiteralC<"IriStemRange">;
        stem: import("io-ts/es6").UnionC<[import("io-ts/es6").StringC, import("io-ts/es6").TypeC<{
            type: import("io-ts/es6").LiteralC<"Wildcard">;
        }>]>;
        exclusions: import("io-ts/es6").ArrayC<import("io-ts/es6").UnionC<[import("io-ts/es6").StringC, import("io-ts/es6").TypeC<{
            type: import("io-ts/es6").LiteralC<"IriStem">;
            stem: import("io-ts/es6").StringC;
        }>]>>;
    }>, import("io-ts/es6").TypeC<{
        type: import("io-ts/es6").LiteralC<"LiteralStem">;
        stem: import("io-ts/es6").StringC;
    }>, import("io-ts/es6").TypeC<{
        type: import("io-ts/es6").LiteralC<"LiteralStemRange">;
        stem: import("io-ts/es6").UnionC<[import("io-ts/es6").StringC, import("io-ts/es6").TypeC<{
            type: import("io-ts/es6").LiteralC<"Wildcard">;
        }>]>;
        exclusions: import("io-ts/es6").ArrayC<import("io-ts/es6").UnionC<[import("io-ts/es6").StringC, import("io-ts/es6").TypeC<{
            type: import("io-ts/es6").LiteralC<"LiteralStem">;
            stem: import("io-ts/es6").StringC;
        }>]>>;
    }>, import("io-ts/es6").TypeC<{
        type: import("io-ts/es6").LiteralC<"Language">;
        languageTag: import("io-ts/es6").StringC;
    }>, import("io-ts/es6").TypeC<{
        type: import("io-ts/es6").LiteralC<"LanguageStem">;
        stem: import("io-ts/es6").StringC;
    }>, import("io-ts/es6").TypeC<{
        type: import("io-ts/es6").LiteralC<"LanguageStemRange">;
        stem: import("io-ts/es6").UnionC<[import("io-ts/es6").StringC, import("io-ts/es6").TypeC<{
            type: import("io-ts/es6").LiteralC<"Wildcard">;
        }>]>;
        exclusions: import("io-ts/es6").ArrayC<import("io-ts/es6").UnionC<[import("io-ts/es6").StringC, import("io-ts/es6").TypeC<{
            type: import("io-ts/es6").LiteralC<"LanguageStem">;
            stem: import("io-ts/es6").StringC;
        }>]>>;
    }>]>>;
}>, import("io-ts/es6").IntersectionC<[import("io-ts/es6").IntersectionC<[import("io-ts/es6").PartialC<{
    length: import("io-ts/es6").NumberC;
}>, import("io-ts/es6").PartialC<{
    minlength: import("io-ts/es6").NumberC;
    maxlength: import("io-ts/es6").NumberC;
}>, import("io-ts/es6").IntersectionC<[import("io-ts/es6").PartialC<{
    pattern: import("io-ts/es6").StringC;
}>, import("io-ts/es6").PartialC<{
    flags: import("io-ts/es6").StringC;
}>]>]>, import("io-ts/es6").PartialC<{
    mininclusive: import("io-ts/es6").NumberC;
    minexclusive: import("io-ts/es6").NumberC;
    maxinclusive: import("io-ts/es6").NumberC;
    maxexclusive: import("io-ts/es6").NumberC;
    totaldigits: import("io-ts/es6").NumberC;
    fractiondigits: import("io-ts/es6").NumberC;
}>]>]>;
export declare const NodeConstraint: Type<ShExParser.NodeConstraint>;
