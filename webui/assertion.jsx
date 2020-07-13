import React, { useState, useCallback, useMemo } from "react"

import { Store, StreamWriter } from "n3"
import { Dataset } from "rdf-cytoscape"
import { useEffect } from "react"

const options = { format: "application/n-quads", blankNodePrefix: "_:" }
function Quads({ store }) {
	const [quads, setQuads] = useState(null)
	useEffect(() => {
		let s = ""
		const writer = new StreamWriter(options)
			.on("data", (chunk) => (s += chunk))
			.on("end", () => setQuads(s))
			.on("error", (err) => console.error(err))

		for (const quad of store.getQuads(null, null, null, null)) {
			writer.write(quad)
		}
		writer.end()
	}, [store])

	if (quads === null) {
		return <pre className="quads">loading...</pre>
	} else {
		return <pre className="quads">{quads}</pre>
	}
}

export default function Assertion({ cid, dataset, onRemove }) {
	const handleRemove = useCallback((_) => onRemove(cid), [cid, onRemove])

	const [view, setView] = useState(null)
	const handleHide = useCallback((event) => setView(null), [])
	const handleGraph = useCallback((event) => setView("graph"), [])
	const handleQuads = useCallback((event) => setView("quads"), [])

	// const [open, setOpen] = useState(false)
	// const handleChange = useCallback((event) => setOpen(event.target.checked), [])

	const store = useMemo(() => new Store(dataset), [dataset])

	return (
		<div className="assertion">
			<pre>dweb:/ipld/{cid}</pre>
			<header>
				<span className="view">
					<button disabled={view === null} onClick={handleHide}>
						Hide
					</button>
					<button disabled={view === "graph"} onClick={handleGraph}>
						View graph
					</button>
					<button disabled={view === "quads"} onClick={handleQuads}>
						View quads
					</button>
				</span>
				<button className="remove" onClick={handleRemove}>
					Remove
				</button>
			</header>
			{view === "graph" ? (
				<div className="rdf-cytoscape">
					<Dataset store={store} focus={undefined} />
				</div>
			) : view === "quads" ? (
				<Quads store={store} />
			) : null}
		</div>
	)
}
