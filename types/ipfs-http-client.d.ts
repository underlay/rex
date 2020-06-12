declare module "ipfs-http-client" {
	function NewIpfsHttpClient(origin: string): Ipfs.CoreAPI
	export class Buffer extends Uint8Array {
		static from(buffer: any): Buffer
		static concat(buffers: Buffer[]): Buffer
		static isBuffer(buffer: any): buffer is Buffer
	}
	export default NewIpfsHttpClient
}

declare module "ipfs" {
	function create(options: {}): Promise<Ipfs.CoreAPI>
}
