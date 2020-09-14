/// <reference types="react" />
import { ProductType, Component } from "../lib/v3/schema.js";
declare type ComponentId = Component & {
    id: string;
};
export declare const makeComponentId: (components: Component[]) => ComponentId[];
export declare function ProductConfig(props: {
    labels: Map<string, string>;
    components: ComponentId[];
    onChange: (type: ProductType) => void;
}): JSX.Element;
export {};
