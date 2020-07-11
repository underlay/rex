import { Store } from "n3";
import { TypeOf } from "io-ts/es6/index.js";
import { Schema } from "./schema.js";
import { Order } from "./order.js";
export declare type Instance = {
    values: Map<string, Set<string>>;
    order: Order;
    min: number;
    max: number;
};
export declare type Instances = Map<string, Instance[]>;
export declare type Entry = [string, string, number, string];
export declare type State = Readonly<{
    references: Map<string, Entry[]>;
    metaReferences: Map<string, Entry[]>;
    types: TypeMap;
    tables: Map<string, Instances>;
    coproduct: Store;
    components: Map<string, string>;
    inverse: Map<string, Set<string>>;
    pushout: Store;
}>;
declare type TypeMap = Map<string, Readonly<{
    type: string;
    shapeExpr: TypeOf<typeof Schema>["shapes"][0];
    key?: string;
}>>;
export declare function getTypeMap(schema: TypeOf<typeof Schema>): TypeMap;
export {};
