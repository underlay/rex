import React from "react"

import { useDebounce } from "use-debounce"

import { Type, Label } from "../lib/apg/schema.js"

import {
	uriPlaceholder,
	namePlaceholder,
	validateKey,
	propertyPatternURL,
	checkDuplicate,
} from "./utils"
import { SelectType } from "./type"

export function LabelConfig(props: {
	labels: Map<string, string>
	namespace: null | string
	clean: boolean
	index: number
	id: string
	keyName: string
	value: Type
	onChange: (label: Label) => void
	onRemove: (index: number) => void
}) {
	const handleChange = React.useCallback(
		(key: string, value: Type) => {
			props.onChange({ type: "label", id: props.id, key, value })
		},
		[props.id, props.onChange]
	)

	const [key, setKey] = React.useState(props.keyName)
	const handleKeyChange = React.useCallback(
		({ target: { value } }: React.ChangeEvent<HTMLInputElement>) =>
			setKey(value),
		[]
	)

	const handleValueChange = React.useCallback(
		(value: Type) => handleChange(props.keyName, value),
		[props.id, props.onChange, props.keyName]
	)

	const [keyName] = useDebounce(key, 1000)
	React.useEffect(() => {
		if (keyName !== props.keyName) {
			handleChange(keyName, props.value)
		}
	}, [keyName])

	const handleClick = React.useCallback(({}) => props.onRemove(props.index), [
		props.onRemove,
		props.index,
	])

	const error = React.useMemo(() => {
		if (validateKey(key, props.namespace)) {
			if (checkDuplicate(props.id, key, props.labels)) {
				return (
					<div className="error">
						<span>Duplicate key</span>
					</div>
				)
			} else {
				return null
			}
		} else {
			return (
				<div className="error">
					<span>Key must validate </span>
					<a href={propertyPatternURL}>this pattern</a>
				</div>
			)
		}
	}, [key, props.id, props.namespace])

	return (
		<div className="label">
			<details open={true}>
				<summary>
					<h2>{props.keyName}</h2>
				</summary>
				<SelectType
					labels={props.labels}
					namespace={props.namespace}
					clean={props.clean}
					value={props.value}
					onChange={handleValueChange}
					error={error}
				>
					<label className="key">
						<span>Key</span>
						<input
							autoFocus={props.clean}
							className="uri"
							type="text"
							value={key}
							placeholder={props.namespace ? namePlaceholder : uriPlaceholder}
							onChange={handleKeyChange}
						/>
					</label>
					<span className="remove">
						<button onClick={handleClick}>Remove label</button>
					</span>
				</SelectType>
			</details>
		</div>
	)
}
