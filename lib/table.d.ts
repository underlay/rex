import { Shape, State } from "./state.js";
export declare type Table = Map<string, Set<string>[]>;
export declare function getTable({ expressions }: Shape, state: State): null | Table;
