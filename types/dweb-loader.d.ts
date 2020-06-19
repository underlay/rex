declare module "dweb-loader" {
	import { RemoteDocument } from "jsonld/jsonld-spec"
	function NewDwebDocumentLoader(
		ipfs: Ipfs.CoreAPI
	): (url: string) => Promise<RemoteDocument>
	export = NewDwebDocumentLoader
}
