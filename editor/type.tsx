import React from "react"

import { useDebounce } from "use-debounce"

import { IRIs } from "n3.ts"

import {
	ReferenceType,
	LiteralType,
	Type,
	isReference,
	NilType,
	IriType,
	ProductType,
	CoproductType,
} from "../lib/apg/schema.js"

import { makeComponentId, ProductConfig } from "./product"
import { CoproductConfig, makeOptionId } from "./coproduct"
import { xsdDatatypes } from "./utils"

type Types = {
	label: ReferenceType
	nil: NilType
	literal: LiteralType
	iri: IriType
	product: ProductType
	coproduct: CoproductType
}

const types: (keyof Types)[] = [
	"nil",
	"literal",
	"iri",
	"product",
	"coproduct",
	"label",
]

function getType(type: Type): keyof Types {
	if (isReference(type)) {
		return "label"
	} else {
		return type.type
	}
}

export function SelectType(props: {
	children: React.ReactNode
	error: React.ReactNode
	labels: Map<string, string>
	namespace: null | string
	value: Type
	onChange: (value: Type) => void
}) {
	const handleTypeChange = React.useCallback(
		({ target: { value } }: React.ChangeEvent<HTMLSelectElement>) => {
			if (value === "nil") {
				props.onChange({ type: "nil" })
			} else if (value === "label") {
				const first = props.labels.keys().next()
				props.onChange({ id: first.value })
			} else if (value === "literal") {
				props.onChange({ type: "literal", datatype: IRIs.xsd.string })
			} else if (value === "iri") {
				props.onChange({ type: "iri" })
			} else if (value === "product") {
				props.onChange({ type: "product", components: [] })
			} else if (value === "coproduct") {
				props.onChange({ type: "coproduct", options: [] })
			}
		},
		[props.labels, props.onChange]
	)

	return (
		<React.Fragment>
			<div className="value">
				<label className="type">
					<span>Type</span>
					<select value={getType(props.value)} onChange={handleTypeChange}>
						{types.map((t) => (
							<option key={t} value={t}>
								{t}
							</option>
						))}
					</select>
				</label>
				{props.children}
			</div>
			{props.error}
			<TypeConfig
				labels={props.labels}
				namespace={props.namespace}
				value={props.value}
				onChange={props.onChange}
			/>
		</React.Fragment>
	)
}

function TypeConfig(props: {
	labels: Map<string, string>
	namespace: null | string
	value: Type
	onChange: (value: Type) => void
}) {
	if (isReference(props.value)) {
		return (
			<ReferenceConfig
				labels={props.labels}
				namespace={props.namespace}
				id={props.value.id}
				onChange={props.onChange}
			/>
		)
	} else if (props.value.type === "nil") {
		return null
	} else if (props.value.type === "literal") {
		return (
			<LiteralConfig
				datatype={props.value.datatype}
				onChange={props.onChange}
			/>
		)
	} else if (props.value.type === "iri") {
		return null
	} else if (props.value.type === "product") {
		return (
			<ProductConfig
				labels={props.labels}
				namespace={props.namespace}
				components={makeComponentId(props.value.components)}
				onChange={props.onChange}
			/>
		)
	} else if (props.value.type === "coproduct") {
		return (
			<CoproductConfig
				labels={props.labels}
				namespace={props.namespace}
				options={makeOptionId(props.value.options)}
				onChange={props.onChange}
			/>
		)
	} else {
		return null
	}
}

function ReferenceConfig(props: {
	labels: Map<string, string>
	namespace: null | string
	id: string
	onChange: (value: ReferenceType) => void
}) {
	const handleChange = React.useCallback(
		({ target: { value } }: React.ChangeEvent<HTMLSelectElement>) =>
			props.onChange({ id: value }),
		[props.onChange]
	)

	return (
		<div className="reference">
			<label>
				<span>Label</span>
				<select value={props.id} onChange={handleChange}>
					{Array.from(props.labels).map(([id, key]) => (
						<option key={id} value={id}>
							{key}
						</option>
					))}
				</select>
			</label>
		</div>
	)
}

function LiteralConfig(props: {
	datatype: string
	onChange: (value: LiteralType) => void
}) {
	const [value, setValue] = React.useState<null | string>(null)

	const index = xsdDatatypes.indexOf(props.datatype)

	const handleSelect = React.useCallback(
		({ target }: React.ChangeEvent<HTMLSelectElement>) => {
			if (target.value === "") {
				props.onChange({ type: "literal", datatype: value || "" })
				if (value === null) {
					setValue("")
				}
			} else {
				const index = xsdDatatypes.indexOf(target.value)
				props.onChange({ type: "literal", datatype: xsdDatatypes[index] })
				if (value !== null) {
					setValue(null)
				}
			}
		},
		[props.onChange]
	)

	const handleChange = React.useCallback(
		({ target: { value } }: React.ChangeEvent<HTMLInputElement>) =>
			setValue(value),
		[]
	)

	const [datatype] = useDebounce(value, 1000)
	const handleDatatypeChange = React.useCallback(
		(datatype: string) => {
			props.onChange({ type: "literal", datatype })
		},
		[props.onChange]
	)
	React.useEffect(() => {
		if (datatype !== null && datatype !== props.datatype) {
			handleDatatypeChange(datatype)
		}
	}, [datatype])

	return (
		<div className="literal">
			<label className="datatype">
				<span>Datatype</span>
				<select value={xsdDatatypes[index]} onChange={handleSelect}>
					{xsdDatatypes.map((xsdDatatype) => (
						<option key={xsdDatatype} value={xsdDatatype}>
							{xsdDatatype.slice(xsdDatatype.lastIndexOf("#") + 1)}
						</option>
					))}
					<option key="custom" value="">
						custom
					</option>
				</select>
				{index === -1 && value !== null && (
					<input
						className="uri"
						type="text"
						value={value}
						onChange={handleChange}
					/>
				)}
			</label>
		</div>
	)
}
