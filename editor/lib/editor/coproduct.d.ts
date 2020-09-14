/// <reference types="react" />
import { CoproductType, Option } from "../lib/v3/schema.js";
declare type OptionId = Option & {
    id: string;
};
export declare const makeOptionId: (options: Option[]) => OptionId[];
export declare function CoproductConfig(props: {
    labels: Map<string, string>;
    options: OptionId[];
    onChange: (type: CoproductType) => void;
}): JSX.Element;
export {};
