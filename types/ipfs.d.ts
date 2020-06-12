declare namespace Ipfs {
	interface CID {}

	interface DagAPI {
		put(
			node: Object,
			options?: { format?: string; hashAlg?: string; pin?: boolean }
		): Promise<CID>
	}

	interface CoreAPI {
		cat(cid: string): AsyncIterable<Buffer>
		dag: DagAPI
	}
}
