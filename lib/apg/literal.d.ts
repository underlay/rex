import ShExCore from "@shexjs/core";
import { DatatypeConstraint } from "./utils.js";
import { LiteralType } from "./schema.js";
export declare type LiteralResult = {
    type: "NodeTest";
    node: string;
    shape: string;
    shapeExpr: DatatypeConstraint;
};
export declare function isLiteralResult(result: ShExCore.SuccessResult): result is LiteralResult;
export declare type LiteralShape = DatatypeConstraint & ({} | {
    pattern: string;
    flags: string;
});
export declare function makeLiteralShape({ type, datatype, ...rest }: LiteralType): LiteralShape;
