import t from "./io.js";
import { Store } from "n3.ts";
import { Schema, AnnotatedTripleConstraint } from "./schema.js";
import { Order } from "./order.js";
export declare type Instance = {
    values: Map<string, Set<string>>;
    order: Order;
    min: number;
    max: number;
};
export declare type Entry = [string, string, number, string];
export declare type State = Readonly<{
    references: Map<string, Entry[]>;
    metaReferences: Map<string, Entry[]>;
    shapes: ShapeMap;
    instances: Map<string, Map<string, Instance[]>>;
    coproduct: Store;
    components: Map<string, string>;
    inverse: Map<string, Set<string>>;
    pushout: Store;
}>;
export declare type Shape = {
    key?: string;
    expressions: AnnotatedTripleConstraint[];
};
export declare type ShapeMap = Map<string, Readonly<Shape>>;
export declare function getShapeMap(schema: t.TypeOf<typeof Schema>): ShapeMap;
export declare function getState(schema: t.TypeOf<typeof Schema>, coproduct: Store): State;
