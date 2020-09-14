/// <reference types="react" />
import { ProductType, Component } from "../lib/apg/schema.js";
declare type ComponentId = Component & {
    id: string;
};
export declare const makeComponentId: (components: Component[]) => ComponentId[];
export declare function ProductConfig(props: {
    labels: Map<string, string>;
    namespace: null | string;
    components: ComponentId[];
    onChange: (type: ProductType) => void;
}): JSX.Element;
export {};
