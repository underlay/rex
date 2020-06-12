import ShExParser from "@shexjs/parser";
import { TypeOf } from "io-ts/es6/index.js";
import { Schema } from "./schema.js";
export declare function loadSchema(uri: string, ipfs: Ipfs.CoreAPI): Promise<ShExParser.Schema>;
export declare function loadReductionSchema(uri: string, ipfs: Ipfs.CoreAPI): Promise<TypeOf<typeof Schema>>;
