import React from "react";
import { Type } from "../lib/apg/schema.js";
export declare function SelectType(props: {
    children: React.ReactNode;
    error: React.ReactNode;
    namespace: null | string;
    autoFocus: boolean;
    propertyId: string;
    valueId: string;
    value: Type;
    onChange: (value: Type) => void;
}): JSX.Element;
