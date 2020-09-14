import React from "react"

import cytoscape from "cytoscape"

import { Label, Type, isReference, LiteralType } from "../lib/apg/schema.js"

import { makeComponentId } from "./product"
import { makeOptionId } from "./coproduct"
import { xsdDatatypes } from "./utils"

export const Layout: cytoscape.LayoutOptions = {
	name: "breadthfirst",
	padding: 12,
	animate: false,
	fit: true,
	spacingFactor: 1.5,
	circle: false,
	directed: true,
}

const Style: cytoscape.Stylesheet[] = [
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
			width: "data(width)",
			height: "data(height)",
			"background-image": "data(svg)",
			shape: "round-rectangle",
			"background-color": "seashell",
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
			shape: "octagon",
			"background-color": "aliceblue",
			"border-color": "lightslategrey",
		},
	},
	{
		selector: "node.coproduct",
		style: {
			shape: "round-octagon",
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
		selector: "edge",
		style: {
			width: 4,
			"font-size": 10,
			"text-background-color": "whitesmoke",
			"text-background-padding": "4",
			"text-background-opacity": 1,
			"font-family": "monospace",
			"curve-style": "straight",
			"source-arrow-shape": "tee",
			"target-arrow-shape": "triangle",
			"text-rotation": ("autorotate" as unknown) as undefined,
		},
	},
	{
		selector: "edge.definition",
		style: {
			label: "[value]",
			"line-style": "solid",
			"line-color": "#ccc",
			"target-arrow-color": "#ccc",
			"source-arrow-color": "#ccc",
		},
	},
	{
		selector: "edge.component",
		style: {
			"line-style": "dashed",
			label: "data(key)",
			"line-color": "lightslategray",
			"target-arrow-color": "lightslategray",
			"source-arrow-color": "lightslategray",
		},
	},
	{
		selector: "edge.option",
		style: {
			"line-style": "dotted",
			"line-color": "#9696ae",
			"target-arrow-color": "#9696ae",
			"source-arrow-color": "#9696ae",
		},
	},
]

let nodeId = 0
function makeTypeElement(
	type: Type,
	elements: cytoscape.ElementDefinition[]
): string {
	if (isReference(type)) {
		return type.id.slice(2)
	} else if (type.type === "nil") {
		const id = `b${nodeId++}`
		elements.push({
			group: "nodes",
			data: { type: type.type, id },
			classes: "nil",
		})
		return id
	} else if (type.type === "iri") {
		const id = `b${nodeId++}`
		elements.push({
			group: "nodes",
			data: { type: type.type, id },
			classes: "iri",
		})
		return id
	} else if (type.type === "literal") {
		const id = `b${nodeId++}`
		const background = makeLiteralBackground(type)
		elements.push({
			group: "nodes",
			data: {
				type: type.type,
				id,
				datatype: type.datatype,
				...background,
			},
			classes: "literal",
		})
		return id
	} else if (type.type === "product") {
		const id = `b${nodeId++}`
		elements.push({
			group: "nodes",
			data: { type: type.type, id },
			classes: "product",
		})
		for (const component of makeComponentId(type.components)) {
			const target = makeTypeElement(component.value, elements)
			elements.push({
				group: "edges",
				data: {
					type: component.type,
					id: component.id.slice(2),
					key: component.key,
					source: id,
					target: target,
				},
				classes: "component",
			})
		}
		return id
	} else if (type.type === "coproduct") {
		const id = `b${nodeId++}`
		elements.push({
			group: "nodes",
			data: { type: type.type, id },
			classes: "coproduct",
		})
		for (const option of makeOptionId(type.options)) {
			const target = makeTypeElement(option.value, elements)
			elements.push({
				group: "edges",
				data: {
					type: option.type,
					id: option.id.slice(2),
					source: id,
					target: target,
				},
				classes: "option",
			})
		}
		return id
	} else {
		throw new Error("Invalid type value")
	}
}

const FONT_FAMILY = "monospace"
const FONT_SIZE = 12
const CHAR = 7.2
const LINE_HEIGHT = 20

function makeLabelBackground(label: Label) {
	const width = CHAR * label.key.length + 8,
		height = LINE_HEIGHT

	return makeBackground(
		`<g><text x="4" y="14">${label.key}</text></g>`,
		width,
		height
	)
}

function makeLiteralBackground(literal: LiteralType) {
	const name = xsdDatatypes.includes(literal.datatype)
		? `[${literal.datatype.slice(literal.datatype.lastIndexOf("#") + 1)}]`
		: `&lt;${literal.datatype}&gt;`

	const width = CHAR * name.length + 8,
		height = LINE_HEIGHT

	return makeBackground(
		`<g><text x="4" y="13">${name}</text></g>`,
		width,
		height
	)
}

const DataURIPrefix = "data:image/svg+xml;utf8,"

const makeBackground = (content: string, width: number, height: number) => ({
	svg:
		DataURIPrefix +
		encodeURIComponent(`<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE svg>
<svg width="${width}" height="${height}"
viewBox="0 0 ${width} ${height}"
fill="none"
xmlns="http://www.w3.org/2000/svg"
font-size="${FONT_SIZE}"
font-family="${FONT_FAMILY}">
<style>
text { fill: black }
</style>
${content}
</svg>`),
	width,
	height,
})

function makeElements(labels: Label[]): cytoscape.ElementDefinition[] {
	const elements: cytoscape.ElementDefinition[] = []
	for (const label of labels) {
		const id = label.id.slice(2)
		const background = makeLabelBackground(label)
		elements.push({
			group: "nodes",
			data: { id, key: label.key, ...background },
			classes: "label",
		})

		const target = makeTypeElement(label.value, elements)

		elements.push({
			group: "edges",
			classes: "definition",
			data: {
				id: `d${nodeId++}`,
				key: label.key,
				source: id,
				target: target,
			},
		})
	}
	return elements
}

export function Graph(props: { labels: Label[] }) {
	const [cy, setCy] = React.useState<null | cytoscape.Core>(null)

	const attachRef = React.useCallback(
		(container: HTMLDivElement) => {
			// Neither of these should really happen?
			if (container === null) {
				return
			} else if (cy !== null) {
				return
			}

			const nextCy = cytoscape({
				container,
				style: Style,
				minZoom: 0.2,
				maxZoom: 2,
				zoom: 1,
			})

			setCy(nextCy)
		},
		[props.labels]
	)

	React.useEffect(() => {
		if (cy !== null) {
			cy.batch(() => {
				cy.elements().remove()
				cy.add(makeElements(props.labels))
			})

			cy.layout(Layout).run()
		}
	}, [props.labels, cy])

	return <div className="container" ref={attachRef} />
}
