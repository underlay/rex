export default function Table({ shape, table, header }) {
	const rows = Array.from(table)
	if (rows.length === 0) {
		return (
			<section className="table">
				<h3>{shape}</h3>
				<pre>Table is empty</pre>
			</section>
		)
	}
	return (
		<section className="table">
			<h3>{shape}</h3>
			<div>
				<table>
					<tbody>
						<tr key="header">
							<th key="id"></th>
							{header.map((value) => (
								<th key={value}>{`<${value}>`}</th>
							))}
						</tr>
						{rows.map(([id, properties]) => (
							<tr key={id}>
								<td key="id">_:{id}</td>
								{properties.map((values, i) => (
									<td key={i}>{Array.from(values).join("\n")}</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</section>
	)
}
