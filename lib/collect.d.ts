import { Node, Property } from "./state.js";
export declare function collect<T extends Node, P extends Property<T>>({ values, order, max, }: P): P["values"];
