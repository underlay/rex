import React from "react"

import { CoproductType, Type, Option } from "../lib/apg/schema.js"

import { setArrayIndex } from "./utils"
import { SelectType } from "./type"

type OptionId = Option & { id: string }

let optionId = 0

const hasOptionId = (option: Option): option is OptionId =>
	option.hasOwnProperty("id")

export const makeOptionId = (options: Option[]): OptionId[] => {
	for (const option of options) {
		if (!hasOptionId(option)) {
			const c = option as OptionId
			c.id = `_:o${optionId++}`
		}
	}
	return options as OptionId[]
}

export function CoproductConfig(props: {
	labels: Map<string, string>
	namespace: null | string
	autoFocus: boolean
	options: OptionId[]
	onChange: (type: CoproductType) => void
}) {
	const handleChange = React.useCallback(
		(index: number, option: OptionId) =>
			props.onChange({
				type: "coproduct",
				options: setArrayIndex(props.options, option, index),
			}),
		[props.onChange, props.options]
	)

	const handleClick = React.useCallback(
		({}) =>
			props.onChange({
				type: "coproduct",
				options: [
					...props.options,
					{
						type: "option",
						id: `_:o${optionId++}`,
						value: { type: "nil" },
					},
				],
			}),
		[props.onChange, props.options]
	)

	const handleRemove = React.useCallback(
		(index: number) => {
			const options = props.options.slice()
			const [] = options.splice(index, 1)
			props.onChange({ type: "coproduct", options })
		},
		[props.onChange, props.options]
	)

	return (
		<React.Fragment>
			<div className="coproduct header">
				<span>Options</span>
				<button className="add" onClick={handleClick}>
					Add option
				</button>
			</div>

			{props.options.map(({ id, value }, index) => (
				<OptionConfig
					key={id}
					id={id}
					value={value}
					index={index}
					labels={props.labels}
					namespace={props.namespace}
					autoFocus={props.autoFocus}
					onChange={handleChange}
					onRemove={handleRemove}
				/>
			))}
		</React.Fragment>
	)
}

function OptionConfig(props: {
	labels: Map<string, string>
	namespace: null | string
	autoFocus: boolean
	index: number
	id: string
	value: Type
	onChange: (index: number, component: OptionId) => void
	onRemove: (index: number) => void
}) {
	const handleClick = React.useCallback(({}) => props.onRemove(props.index), [
		props.onRemove,
		props.index,
	])

	const handleTypeChange = React.useCallback(
		(value: Type) => {
			props.onChange(props.index, {
				type: "option",
				id: props.id,
				value: value,
			})
		},
		[props.onChange]
	)

	return (
		<div className="coproduct entry">
			<SelectType
				labels={props.labels}
				namespace={props.namespace}
				autoFocus={props.autoFocus}
				value={props.value}
				onChange={handleTypeChange}
				error={null}
			>
				<span className="remove">
					<button onClick={handleClick}>Remove option</button>
				</span>
			</SelectType>
		</div>
	)
}
