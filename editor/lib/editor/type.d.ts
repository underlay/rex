import React from "react";
import { Type } from "../lib/v3/schema.js";
export declare function SelectType(props: {
    children: React.ReactNode;
    labels: Map<string, string>;
    value: Type;
    onChange: (value: Type) => void;
}): JSX.Element;
