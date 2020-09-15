/// <reference types="react" />
import { CoproductType, Option } from "../lib/apg/schema.js";
declare type OptionId = Option & {
    id: string;
};
export declare const makeOptionId: (options: Option[]) => OptionId[];
export declare function CoproductConfig(props: {
    namespace: null | string;
    autoFocus: boolean;
    options: OptionId[];
    parent: string;
    onChange: (type: CoproductType) => void;
}): JSX.Element;
export {};
