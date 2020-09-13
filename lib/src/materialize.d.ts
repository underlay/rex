import t from "./io.js";
import { Store, Quad } from "n3.ts";
import { Schema } from "./schema.js";
import { Table } from "./table.js";
export declare function materialize(schema: t.TypeOf<typeof Schema>, coproduct: Store): [Map<string, string[]>, Map<string, Table>];
export declare function getQuads(table: Table, header: string[]): Generator<Quad>;
