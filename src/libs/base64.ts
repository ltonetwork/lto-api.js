import { TBuffer } from "../../interfaces";

export function encode(buffer: TBuffer): string {
	return typeof Buffer !== 'undefined'
		? Buffer.from(buffer).toString("base64")
		: btoa(String.fromCharCode.apply(null, Array.from(buffer)));
}

export function	decode(message: string): Uint8Array {
	return Uint8Array.from(atob(message), (c) => c.charCodeAt(0));
}
