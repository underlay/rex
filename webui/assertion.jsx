import React, { useState, useCallback, useMemo } from "react"

import { Dataset } from "rdf-cytoscape"
import { Store, toId } from "n3.ts"

const options = { format: "application/n-quads", blankNodePrefix: "_:" }
function Quads({ store }) {
	const quads = useMemo(() => {
		let s = ""
		for (const quad of store.getQuads(null, null, null, null)) {
			s += toId(quad.subject) + " "
			s += toId(quad.predicate) + " "
			s += toId(quad.object) + " "
			if (quad.graph.termType === "DefaultGraph") {
				s += ".\n"
			} else {
				s += toId(quad.graph) + " .\n"
			}
		}
		return s
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
	const handleHide = useCallback(({}) => setView(null), [])
	const handleGraph = useCallback(({}) => setView("graph"), [])
	const handleQuads = useCallback(({}) => setView("quads"), [])

	const store = useMemo(() => new Store(dataset), [dataset])

	return (
		<div className="assertion">
			<pre>ul:{cid}</pre>
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
