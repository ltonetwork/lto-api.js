import { TBuffer } from "../interfaces";

declare const Buffer;

export default {

	encode(buffer: TBuffer): string {
		return Buffer.from(String.fromCharCode.apply(null, buffer), "binary").toString("base64");
	},

	decode(message: string): Uint8Array {
		const bytes = Buffer.from(message, "base64").toString("binary");
		return new Uint8Array(bytes.split("").map(charCodeAt));

		function charCodeAt (c) {
			return c.charCodeAt(0);
		}
	}
};
