import React from "react"

import { useDebounce } from "use-debounce"

import { ProductType, Type, Component } from "../lib/apg/schema.js"

import {
	setArrayIndex,
	uriPlaceholder,
	validateKey,
	propertyPatternURL,
	namePlaceholder,
	checkDuplicate,
} from "./utils"
import { SelectType } from "./type"

type ComponentId = Component & { id: string }

let componentId = 0

const hasComponentId = (component: Component): component is ComponentId =>
	component.hasOwnProperty("id")

export const makeComponentId = (components: Component[]): ComponentId[] => {
	for (const component of components) {
		if (!hasComponentId(component)) {
			const c = component as ComponentId
			c.id = `_:c${componentId++}`
		}
	}
	return components as ComponentId[]
}

export function ProductConfig(props: {
	labels: Map<string, string>
	namespace: null | string
	components: ComponentId[]
	onChange: (type: ProductType) => void
}) {
	const handleChange = React.useCallback(
		(index: number, component: ComponentId) => {
			const components = setArrayIndex(props.components, component, index)
			props.onChange({ type: "product", components })
		},
		[props.onChange, props.components]
	)

	const handleClick = React.useCallback(
		({}) =>
			props.onChange({
				type: "product",
				components: [
					...props.components,
					{
						type: "component",
						id: `_:c${componentId++}`,
						key: "",
						value: { type: "nil" },
					},
				],
			}),
		[props.onChange, props.components]
	)

	const handleRemove = React.useCallback(
		(index: number) => {
			const components = props.components.slice()
			const [] = components.splice(index, 1)
			props.onChange({ type: "product", components })
		},
		[props.onChange, props.components]
	)

	return (
		<React.Fragment>
			<div className="product header">
				<span>Components</span>
				<button className="add" onClick={handleClick}>
					Add component
				</button>
			</div>

			{props.components.map(({ id, key, value }, index) => (
				<ComponentConfig
					key={id}
					id={id}
					keyName={key}
					value={value}
					index={index}
					labels={props.labels}
					namespace={props.namespace}
					onChange={handleChange}
					onRemove={handleRemove}
				/>
			))}
		</React.Fragment>
	)
}

function ComponentConfig(props: {
	labels: Map<string, string>
	namespace: null | string
	index: number
	id: string
	keyName: string
	value: Type
	onChange: (index: number, component: ComponentId) => void
	onRemove: (index: number) => void
}) {
	const [key, setKey] = React.useState(props.keyName)
	const handleChange = React.useCallback(
		({ target: { value } }: React.ChangeEvent<HTMLInputElement>) =>
			setKey(value),
		[]
	)

	const [keyName] = useDebounce(key, 1000)
	React.useEffect(() => {
		if (keyName !== props.keyName) {
			props.onChange(props.index, {
				type: "component",
				id: props.id,
				key: keyName,
				value: props.value,
			})
		}
	}, [keyName, props.index, props.id, props.value, props.onChange])

	const handleClick = React.useCallback(({}) => props.onRemove(props.index), [
		props.onRemove,
		props.index,
	])

	const handleTypeChange = React.useCallback(
		(value: Type) => {
			props.onChange(props.index, {
				type: "component",
				id: props.id,
				key: props.keyName,
				value: value,
			})
		},
		[props.onChange]
	)

	const error = React.useMemo(() => {
		if (validateKey(key, props.namespace)) {
			if (checkDuplicate(props.id, key, props.labels)) {
				return (
					<div className="error">
						<span>Duplicate key</span>
					</div>
				)
			} else {
			}
		} else {
			return (
				<div className="error">
					<span>Key must validate </span>
					<a href={propertyPatternURL}>this pattern</a>
				</div>
			)
		}
		return null
	}, [key, props.id, props.namespace])

	return (
		<div className="product entry">
			<SelectType
				labels={props.labels}
				namespace={props.namespace}
				value={props.value}
				onChange={handleTypeChange}
				error={error}
			>
				<label className="key">
					<span>Key</span>
					<input
						autoFocus={true}
						className="uri"
						type="text"
						value={key}
						onChange={handleChange}
						placeholder={props.namespace ? namePlaceholder : uriPlaceholder}
					/>
				</label>
				<span className="remove">
					<button onClick={handleClick}>Remove component</button>
				</span>
			</SelectType>
		</div>
	)
}
