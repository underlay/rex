/// <reference types="react" />
import cytoscape from "cytoscape";
import { Label } from "../lib/apg/schema.js";
export declare const Layout: cytoscape.LayoutOptions;
export declare function Graph(props: {
    labels: Label[];
}): JSX.Element;
