/// <reference types="react" />
import { Type, Label } from "../lib/apg/schema.js";
export declare function LabelConfig(props: {
    labels: Map<string, string>;
    namespace: null | string;
    autoFocus: boolean;
    index: number;
    id: string;
    keyName: string;
    value: Type;
    onChange: (label: Label) => void;
    onRemove: (index: number) => void;
}): JSX.Element;
