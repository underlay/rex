/// <reference types="react" />
import { ProductType, Component } from "../lib/apg/schema.js";
declare type ComponentId = Component & {
    id: string;
};
export declare const makeComponentId: (components: Component[]) => ComponentId[];
export declare function ProductConfig(props: {
    namespace: null | string;
    autoFocus: boolean;
    components: ComponentId[];
    parent: string;
    onChange: (type: ProductType) => void;
}): JSX.Element;
export {};
