import { TBuffer } from "../../interfaces";

export function encode(buffer: TBuffer): string {
	return Buffer.from(
		String.fromCharCode.apply(null, Array.from(buffer)),
		"binary"
	).toString("base64");
}

export function	decode(message: string): Uint8Array {
	const bytes = Buffer.from(message, "base64").toString("binary");
	return new Uint8Array(bytes.split("").map(c => c.charCodeAt(0)));
}
