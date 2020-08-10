import t from "./io.js";
import * as ShExParser from "@shexjs/parser";
export declare const ObjectLiteral: t.IntersectionC<[t.TypeC<{
    value: t.StringC;
}>, t.PartialC<{
    language: t.StringC;
    type: t.StringC;
}>]>;
export declare const objectValue: t.UnionC<[t.StringC, t.IntersectionC<[t.TypeC<{
    value: t.StringC;
}>, t.PartialC<{
    language: t.StringC;
    type: t.StringC;
}>]>]>;
export declare const Wildcard: t.TypeC<{
    type: t.LiteralC<"Wildcard">;
}>;
export declare const IriStem: t.TypeC<{
    type: t.LiteralC<"IriStem">;
    stem: t.StringC;
}>;
export declare const IriStemRange: t.TypeC<{
    type: t.LiteralC<"IriStemRange">;
    stem: t.UnionC<[t.StringC, t.TypeC<{
        type: t.LiteralC<"Wildcard">;
    }>]>;
    exclusions: t.ArrayC<t.UnionC<[t.StringC, t.TypeC<{
        type: t.LiteralC<"IriStem">;
        stem: t.StringC;
    }>]>>;
}>;
export declare const LiteralStem: t.TypeC<{
    type: t.LiteralC<"LiteralStem">;
    stem: t.StringC;
}>;
export declare const LiteralStemRange: t.TypeC<{
    type: t.LiteralC<"LiteralStemRange">;
    stem: t.UnionC<[t.StringC, t.TypeC<{
        type: t.LiteralC<"Wildcard">;
    }>]>;
    exclusions: t.ArrayC<t.UnionC<[t.StringC, t.TypeC<{
        type: t.LiteralC<"LiteralStem">;
        stem: t.StringC;
    }>]>>;
}>;
export declare const Language: t.TypeC<{
    type: t.LiteralC<"Language">;
    languageTag: t.StringC;
}>;
export declare const LanguageStem: t.TypeC<{
    type: t.LiteralC<"LanguageStem">;
    stem: t.StringC;
}>;
export declare const LanguageStemRange: t.TypeC<{
    type: t.LiteralC<"LanguageStemRange">;
    stem: t.UnionC<[t.StringC, t.TypeC<{
        type: t.LiteralC<"Wildcard">;
    }>]>;
    exclusions: t.ArrayC<t.UnionC<[t.StringC, t.TypeC<{
        type: t.LiteralC<"LanguageStem">;
        stem: t.StringC;
    }>]>>;
}>;
export declare const valueSetValue: t.UnionC<[t.UnionC<[t.StringC, t.IntersectionC<[t.TypeC<{
    value: t.StringC;
}>, t.PartialC<{
    language: t.StringC;
    type: t.StringC;
}>]>]>, t.TypeC<{
    type: t.LiteralC<"IriStem">;
    stem: t.StringC;
}>, t.TypeC<{
    type: t.LiteralC<"IriStemRange">;
    stem: t.UnionC<[t.StringC, t.TypeC<{
        type: t.LiteralC<"Wildcard">;
    }>]>;
    exclusions: t.ArrayC<t.UnionC<[t.StringC, t.TypeC<{
        type: t.LiteralC<"IriStem">;
        stem: t.StringC;
    }>]>>;
}>, t.TypeC<{
    type: t.LiteralC<"LiteralStem">;
    stem: t.StringC;
}>, t.TypeC<{
    type: t.LiteralC<"LiteralStemRange">;
    stem: t.UnionC<[t.StringC, t.TypeC<{
        type: t.LiteralC<"Wildcard">;
    }>]>;
    exclusions: t.ArrayC<t.UnionC<[t.StringC, t.TypeC<{
        type: t.LiteralC<"LiteralStem">;
        stem: t.StringC;
    }>]>>;
}>, t.TypeC<{
    type: t.LiteralC<"Language">;
    languageTag: t.StringC;
}>, t.TypeC<{
    type: t.LiteralC<"LanguageStem">;
    stem: t.StringC;
}>, t.TypeC<{
    type: t.LiteralC<"LanguageStemRange">;
    stem: t.UnionC<[t.StringC, t.TypeC<{
        type: t.LiteralC<"Wildcard">;
    }>]>;
    exclusions: t.ArrayC<t.UnionC<[t.StringC, t.TypeC<{
        type: t.LiteralC<"LanguageStem">;
        stem: t.StringC;
    }>]>>;
}>]>;
export declare const lengthFacet: t.PartialC<{
    length: t.NumberC;
}>;
export declare const lengthRangeFacet: t.PartialC<{
    minlength: t.NumberC;
    maxlength: t.NumberC;
}>;
export declare const patternFacet: t.IntersectionC<[t.PartialC<{
    pattern: t.StringC;
}>, t.PartialC<{
    flags: t.StringC;
}>]>;
export declare const stringFacet: t.IntersectionC<[t.PartialC<{
    length: t.NumberC;
}>, t.PartialC<{
    minlength: t.NumberC;
    maxlength: t.NumberC;
}>, t.IntersectionC<[t.PartialC<{
    pattern: t.StringC;
}>, t.PartialC<{
    flags: t.StringC;
}>]>]>;
export declare const numericFacet: t.PartialC<{
    mininclusive: t.NumberC;
    minexclusive: t.NumberC;
    maxinclusive: t.NumberC;
    maxexclusive: t.NumberC;
    totaldigits: t.NumberC;
    fractiondigits: t.NumberC;
}>;
export declare const xsFacet: t.IntersectionC<[t.IntersectionC<[t.PartialC<{
    length: t.NumberC;
}>, t.PartialC<{
    minlength: t.NumberC;
    maxlength: t.NumberC;
}>, t.IntersectionC<[t.PartialC<{
    pattern: t.StringC;
}>, t.PartialC<{
    flags: t.StringC;
}>]>]>, t.PartialC<{
    mininclusive: t.NumberC;
    minexclusive: t.NumberC;
    maxinclusive: t.NumberC;
    maxexclusive: t.NumberC;
    totaldigits: t.NumberC;
    fractiondigits: t.NumberC;
}>]>;
export declare const iriNodeKind: t.IntersectionC<[t.TypeC<{
    type: t.LiteralC<"NodeConstraint">;
    nodeKind: t.LiteralC<"iri">;
}>, t.IntersectionC<[t.PartialC<{
    length: t.NumberC;
}>, t.PartialC<{
    minlength: t.NumberC;
    maxlength: t.NumberC;
}>, t.IntersectionC<[t.PartialC<{
    pattern: t.StringC;
}>, t.PartialC<{
    flags: t.StringC;
}>]>]>]>;
export declare const literalNodeKind: t.IntersectionC<[t.TypeC<{
    type: t.LiteralC<"NodeConstraint">;
    nodeKind: t.LiteralC<"literal">;
}>, t.IntersectionC<[t.IntersectionC<[t.PartialC<{
    length: t.NumberC;
}>, t.PartialC<{
    minlength: t.NumberC;
    maxlength: t.NumberC;
}>, t.IntersectionC<[t.PartialC<{
    pattern: t.StringC;
}>, t.PartialC<{
    flags: t.StringC;
}>]>]>, t.PartialC<{
    mininclusive: t.NumberC;
    minexclusive: t.NumberC;
    maxinclusive: t.NumberC;
    maxexclusive: t.NumberC;
    totaldigits: t.NumberC;
    fractiondigits: t.NumberC;
}>]>]>;
export declare type dataTypeConstraint<T extends string> = {
    type: "NodeConstraint";
    datatype: T;
} & t.TypeOf<typeof xsFacet>;
export declare const dataTypeConstraint: <T extends string>(datatype: t.Type<T, T, unknown>) => t.Type<dataTypeConstraint<T>, dataTypeConstraint<T>, unknown>;
export declare const dataType: t.Type<dataTypeConstraint<string>, dataTypeConstraint<string>, unknown>;
export declare const valueSet: t.IntersectionC<[t.TypeC<{
    type: t.LiteralC<"NodeConstraint">;
    values: t.ArrayC<t.UnionC<[t.UnionC<[t.StringC, t.IntersectionC<[t.TypeC<{
        value: t.StringC;
    }>, t.PartialC<{
        language: t.StringC;
        type: t.StringC;
    }>]>]>, t.TypeC<{
        type: t.LiteralC<"IriStem">;
        stem: t.StringC;
    }>, t.TypeC<{
        type: t.LiteralC<"IriStemRange">;
        stem: t.UnionC<[t.StringC, t.TypeC<{
            type: t.LiteralC<"Wildcard">;
        }>]>;
        exclusions: t.ArrayC<t.UnionC<[t.StringC, t.TypeC<{
            type: t.LiteralC<"IriStem">;
            stem: t.StringC;
        }>]>>;
    }>, t.TypeC<{
        type: t.LiteralC<"LiteralStem">;
        stem: t.StringC;
    }>, t.TypeC<{
        type: t.LiteralC<"LiteralStemRange">;
        stem: t.UnionC<[t.StringC, t.TypeC<{
            type: t.LiteralC<"Wildcard">;
        }>]>;
        exclusions: t.ArrayC<t.UnionC<[t.StringC, t.TypeC<{
            type: t.LiteralC<"LiteralStem">;
            stem: t.StringC;
        }>]>>;
    }>, t.TypeC<{
        type: t.LiteralC<"Language">;
        languageTag: t.StringC;
    }>, t.TypeC<{
        type: t.LiteralC<"LanguageStem">;
        stem: t.StringC;
    }>, t.TypeC<{
        type: t.LiteralC<"LanguageStemRange">;
        stem: t.UnionC<[t.StringC, t.TypeC<{
            type: t.LiteralC<"Wildcard">;
        }>]>;
        exclusions: t.ArrayC<t.UnionC<[t.StringC, t.TypeC<{
            type: t.LiteralC<"LanguageStem">;
            stem: t.StringC;
        }>]>>;
    }>]>>;
}>, t.IntersectionC<[t.IntersectionC<[t.PartialC<{
    length: t.NumberC;
}>, t.PartialC<{
    minlength: t.NumberC;
    maxlength: t.NumberC;
}>, t.IntersectionC<[t.PartialC<{
    pattern: t.StringC;
}>, t.PartialC<{
    flags: t.StringC;
}>]>]>, t.PartialC<{
    mininclusive: t.NumberC;
    minexclusive: t.NumberC;
    maxinclusive: t.NumberC;
    maxexclusive: t.NumberC;
    totaldigits: t.NumberC;
    fractiondigits: t.NumberC;
}>]>]>;
export declare const NodeConstraint: t.Type<ShExParser.NodeConstraint>;
