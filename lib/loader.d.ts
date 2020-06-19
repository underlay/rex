import ShExParser from "@shexjs/parser";
export declare function loadURI(uri: string, ipfs?: Ipfs.CoreAPI | null): Promise<ShExParser.Schema>;
export declare function loadText(shex: string, ipfs?: Ipfs.CoreAPI | null): Promise<ShExParser.Schema>;
