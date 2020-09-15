import cytoscape from "cytoscape";
export declare type LayoutOptions = {
    circle: boolean;
    directed: boolean;
    inverted: boolean;
};
export declare const MakeLayout: ({ circle, directed, inverted, }: LayoutOptions) => cytoscape.LayoutOptions;
export declare const Style: cytoscape.Stylesheet[];
export declare const FooterStyle: cytoscape.Stylesheet[];
