import cytoscape from "cytoscape"

export const Layout: cytoscape.LayoutOptions = {
	name: "breadthfirst",
	padding: 12,
	animate: false,
	fit: true,
	spacingFactor: 1.5,
	circle: false,
	directed: true,
}

export const Style: cytoscape.Stylesheet[] = [
	{
		selector: "node",
		style: {
			"border-width": 1,
			"border-style": "solid",
			"border-color": "#95a482",
		},
	},
	{
		selector: "node.label",
		style: {
			"border-width": 2,
			width: "data(width)",
			height: "data(height)",
			"background-image": "data(svg)",
			shape: "round-rectangle",
			"background-color": "seashell",
			"border-color": "dimgrey",
		},
	},
	{
		selector: "node.literal",
		style: {
			width: "data(width)",
			height: "data(height)",
			"background-image": "data(svg)",
			shape: "rectangle",
			"background-color": "lightyellow",
		},
	},
	{
		selector: "node.product",
		style: {
			shape: "hexagon",
			width: 36,
			height: 30,
			"background-color": "aliceblue",
			"border-color": "lightslategrey",
		},
	},
	{
		selector: "node.coproduct",
		style: {
			shape: "round-hexagon",
			width: 36,
			height: 30,
			"background-color": "lavender",
			"border-color": "#9696ae",
		},
	},
	{
		selector: "node.nil",
		style: {
			shape: "ellipse",
			"background-color": "#ccc",
			"border-color": "grey",
		},
	},
	{
		selector: "node.iri",
		style: {
			shape: "diamond",
			"background-color": "darkseagreen",
		},
	},
	{
		selector: "node.reference",
		style: {
			width: 20,
			height: 16,
			shape: "round-tag",
			"background-color": "mistyrose",
		},
	},
	{
		selector: "edge.definition, edge.component, edge.option",
		style: {
			width: 4,
			"curve-style": "straight",
			"source-arrow-shape": "tee",
			"target-arrow-shape": "triangle",
			"z-index": 2,
		},
	},
	{
		selector: "edge.reference",
		style: {
			"curve-style": "unbundled-bezier",
			"control-point-distances": "-40",
			"control-point-weights": "0.33",
			"line-style": "solid",
			"line-color": "#ddd",
			"z-index": 1,
		},
	},
	{
		selector: "edge.definition",
		style: {
			width: 3,
			"line-style": "solid",
			"line-color": "dimgrey",
			"target-arrow-color": "dimgrey",
			"source-arrow-color": "dimgrey",
		},
	},
	{
		selector: "edge.component",
		style: {
			label: "data(key)",
			"font-size": 10,
			"text-background-color": "whitesmoke",
			"text-background-padding": "4",
			"text-background-opacity": 1,
			"font-family": "monospace",
			"text-rotation": ("autorotate" as unknown) as undefined,
			"line-style": "dashed",
			"line-dash-pattern": [9, 3],
			"line-color": "lightslategray",
			"target-arrow-color": "lightslategray",
			"source-arrow-color": "lightslategray",
		},
	},
	{
		selector: "edge.option",
		style: {
			"line-style": "dashed",
			"line-dash-pattern": [4, 4],
			"line-color": "#9696ae",
			"target-arrow-color": "#9696ae",
			"source-arrow-color": "#9696ae",
		},
	},
]
