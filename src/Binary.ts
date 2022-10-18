import {Encoding, decode, encode} from "./utils/encoder";
import {IBinary} from "../interfaces";
import converters from "./libs/converters";
import * as crypto from "./utils/crypto";

export default class Binary extends Uint8Array implements IBinary {
	constructor(value?: string | ArrayLike<number>) {
		const bytes = typeof value === "string"
			? converters.stringToByteArray(value)
			: value;

		super(bytes);
	}

	public get base58() {
		return encode(this, Encoding.base58);
	}

	public get base64() {
		return encode(this, Encoding.base64);
	}

	public get hex() {
		return encode(this, Encoding.hex);
	}

	/** Create a SHA256 hash */
	public hash(): Binary {
		return new Binary(crypto.sha256(this));
	}

	public toString() {
		return converters.byteArrayToString(this);
	}

	public slice(start?: number, end?: number): Binary {
		return new Binary(super.slice(start, end));
	}

	public reverse(): Binary {
		return new Binary(super.reverse());
	}

	public static fromBase58(value: string): Binary {
		return new Binary(decode(value, Encoding.base58));
	}

	public static fromBase64(value: string): Binary {
		return new Binary(decode(value, Encoding.base64));
	}

	public static fromHex(value: string): Binary {
		return new Binary(decode(value, Encoding.hex));
	}
}
