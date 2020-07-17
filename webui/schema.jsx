import React, { useState, useCallback, useEffect } from "react"

import { useDebounce } from "use-debounce"

import { loadText } from "../lib/loader.js"
import { Schema } from "../lib/schema.js"

const reduceContext = ([_, path], { key, type: { name } }) => [
	name,
	path + "/" + key,
]

function getError({ context, message }) {
	const [name, path] = context.reduce(reduceContext, ["", ""])
	let err = `${path}: ${name}`
	if (err.startsWith("//")) {
		err = err.slice(1)
	}
	if (message !== undefined) {
		err += `\n${message}`
	}
	return err
}

export default function ({ value, onChange }) {
	const [error, setError] = useState(null)
	const [text, setText] = useState(value)
	useEffect(() => {
		if (text !== value) {
			setText(value)
		}
	}, [value])

	const [shex] = useDebounce(text, 1000)
	useEffect(() => {
		if (shex === "" && value === "") {
			return
		}
		loadText(shex, null)
			.then((schema) => {
				const result = Schema.decode(schema)
				if (result._tag === "Left") {
					setError(result.left.map(getError).join("\n"))
				} else {
					onChange(result.right)
					if (error !== null) {
						setError(null)
					}
				}
			})
			.catch((err) => setError(err.toString()))
	}, [shex])

	const handleChange = useCallback((event) => setText(event.target.value), [])
	return (
		<React.Fragment>
			<textarea
				value={text}
				onChange={handleChange}
				spellCheck={false}
			></textarea>
			{error === null ? null : (
				<div className="error">
					<pre>{error}</pre>
				</div>
			)}
		</React.Fragment>
	)
}
