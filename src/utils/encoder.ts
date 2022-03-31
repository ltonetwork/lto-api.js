import base58 from "../libs/base58";
import base64 from "../libs/base64";

export enum Encoding {
    base58 = "base58",
    base64 = "base64",
    hex = "hex",
}

function hexToBytes(hex: string): Uint8Array {
	const bytes = [];
	for (let c = 0; c < hex.length; c += 2)
		bytes.push(parseInt(hex.substr(c, 2), 16));
	return new Uint8Array(bytes);
}

/** Convert a byte array to a hex string */
function bytesToHex(bytes: Uint8Array): string {
	const hex: string[] = [];
	for (let i = 0; i < bytes.length; i++) {
		const current = bytes[i] < 0 ? bytes[i] + 256 : bytes[i];
		hex.push((current >>> 4).toString(16));
		hex.push((current & 0xF).toString(16));
	}
	return hex.join("");
}

export function encode(input: Uint8Array, encoding = Encoding.base58): string {
	switch (encoding) {
	case Encoding.base58:
		return base58.encode(input);
	case Encoding.base64:
		return base64.encode(input);
	case Encoding.hex:
		return bytesToHex(input);
	}
}

export function decode(input: string, encoding = Encoding.base58): Uint8Array {
	switch (encoding) {
	case Encoding.base58:
		return base58.decode(input);
	case Encoding.base64:
		return base64.decode(input);
	case Encoding.hex:
		return hexToBytes(input);
	}
}

export function recode(string, from_encoding: Encoding, to_encoding: Encoding): string {
	return encode(
		decode(string, from_encoding),
		to_encoding
	);
}

/** returns a hexadecimal compressed publicKey */
export function add_prefix(x: string, y: string): string {
	const significant_bit = y.slice(y.length - 1);
	const int = parseInt(significant_bit, 16);

	return int % 2 == 0 ? "02" + x : "03" + x;
}

/** returns a hexadecimal compressed publicKey from a hexadecimal uncompressed one */
export function getCompressPublicKey(pubKey: string): string{
	if (pubKey[1] == "x")
		pubKey = pubKey.substring(4);
	else
		pubKey = pubKey.substring(2);
	const middle = pubKey.length / 2;
	return this.add_prefix(pubKey.substr(0, middle), pubKey.substr(middle + 1));
}

export function fromHex(hex: string): string {
	return decodeURIComponent(hex.replace(/(..)/g, "%$1"));
}

export function toHex(str: string): string {
	return unescape(encodeURIComponent(str))
		.split("").map(function (v) {
			return v.charCodeAt(0).toString(16);
		}).join("");
}
