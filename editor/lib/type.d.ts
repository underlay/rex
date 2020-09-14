import React from "react";
import { Type } from "../lib/apg/schema.js";
export declare function SelectType(props: {
    children: React.ReactNode;
    error: React.ReactNode;
    labels: Map<string, string>;
    namespace: null | string;
    autoFocus: boolean;
    value: Type;
    onChange: (value: Type) => void;
}): JSX.Element;
