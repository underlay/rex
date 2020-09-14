import React from "react"

import cytoscape from "cytoscape"

import { Label, Type, isReference, LiteralType } from "../lib/apg/schema.js"

import { makeComponentId } from "./product"
import { makeOptionId } from "./coproduct"
import { xsdDatatypes } from "./utils"
import { Style, Layout } from "./style"

const FONT_FAMILY = "monospace"
const FONT_SIZE = 12
const CHAR = 7.2
const LINE_HEIGHT = 20

const DataURIPrefix = "data:image/svg+xml;utf8,"

const makeBackground = (content: string, width: number, height: number) => ({
	width,
	height,
	svg:
		DataURIPrefix +
		encodeURIComponent(`<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE svg>
<svg width="${width}" height="${height}"
viewBox="0 0 ${width} ${height}"
fill="none"
xmlns="http://www.w3.org/2000/svg"
font-size="${FONT_SIZE}"
font-family="${FONT_FAMILY}">
<style>text { fill: black }</style>
${content}
</svg>`),
})

function makeLabelBackground(label: Label) {
	const width = Math.max(CHAR * label.key.length + 8, 20),
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

function makeElements(labels: Label[]): cytoscape.ElementDefinition[] {
	const elements: cytoscape.ElementDefinition[] = []
	for (const label of labels) {
		const id = label.id.slice(2)
		const background = makeLabelBackground(label)
		elements.push({
			group: "nodes",
			classes: "label",
			data: { id, key: label.key, ...background },
		})

		const target = makeTypeElement(id, label.value, elements)

		elements.push({
			group: "edges",
			classes: "definition",
			data: {
				id: `${id}-def`,
				key: label.key,
				source: id,
				target: target,
			},
		})
	}
	return elements
}

function makeTypeElement(
	parent: string,
	type: Type,
	elements: cytoscape.ElementDefinition[]
): string {
	const id = `${parent}-val`
	if (isReference(type)) {
		elements.push(
			{
				group: "nodes",
				classes: "reference",
				data: { type: "reference", id },
			},
			{
				group: "edges",
				classes: "reference",
				data: {
					type: "reference",
					id: `${parent}-ref`,
					source: id,
					target: type.id.slice(2),
				},
			}
		)
	} else if (type.type === "nil") {
		const id = `${parent}-val`
		elements.push({
			group: "nodes",
			classes: "nil",
			data: { type: type.type, id },
		})
	} else if (type.type === "iri") {
		elements.push({
			group: "nodes",
			classes: "iri",
			data: { type: type.type, id },
		})
	} else if (type.type === "literal") {
		const background = makeLiteralBackground(type)
		elements.push({
			group: "nodes",
			classes: "literal",
			data: {
				type: type.type,
				id,
				datatype: type.datatype,
				...background,
			},
		})
	} else if (type.type === "product") {
		elements.push({
			group: "nodes",
			classes: "product",
			data: { type: type.type, id },
		})
		for (const component of makeComponentId(type.components)) {
			const componentId = component.id.slice(2)
			const target = makeTypeElement(componentId, component.value, elements)
			elements.push({
				group: "edges",
				classes: "component",
				data: {
					type: component.type,
					id: componentId,
					key: component.key,
					source: id,
					target: target,
				},
			})
		}
	} else if (type.type === "coproduct") {
		elements.push({
			group: "nodes",
			classes: "coproduct",
			data: { type: type.type, id },
		})
		for (const option of makeOptionId(type.options)) {
			const optionId = option.id.slice(2)
			const target = makeTypeElement(optionId, option.value, elements)
			elements.push({
				group: "edges",
				classes: "option",
				data: {
					type: option.type,
					id: optionId,
					source: id,
					target: target,
				},
			})
		}
	} else {
		throw new Error("Invalid type value")
	}
	return id
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
				userPanningEnabled: false,
				userZoomingEnabled: false,
				autoungrabify: true,
				zoom: 1,
				maxZoom: 2,
				minZoom: 0.5,
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
				cy.elements("node, edge").layout(Layout).run()
			})
		}
	}, [props.labels, cy])

	return <div className="container" ref={attachRef} />
}
