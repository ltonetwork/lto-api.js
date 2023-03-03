import {Encoding, decode, encode} from "./utils/encoder";
import {IBinary} from "../interfaces";
import {sha256} from "./utils/sha256";

export default class Binary extends Uint8Array implements IBinary {
	constructor(value?: string | ArrayLike<number>) {
		const bytes = typeof value === "string"
			? new TextEncoder().encode(value)
			: value;

		if (bytes === undefined) throw Error("Failed to convert value to binary");
		super(bytes);
	}

	public get base58(): string {
		return encode(this, Encoding.base58);
	}

	public get base64(): string {
		return encode(this, Encoding.base64);
	}

	public get hex(): string {
		return encode(this, Encoding.hex);
	}

	/** Create a SHA256 hash */
	public hash(): Binary {
		return new Binary(sha256(this));
	}

	public toString(): string {
		return new TextDecoder().decode(this);
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
