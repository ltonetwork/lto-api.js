import * as convert from "../utils/convert";

import {IBinary, IEventJSON, ISigner} from "../../interfaces";
import EventChain from "./EventChain";
import Binary from "../Binary";
import {ED25519} from "../accounts/ed25519/ED25519";
import {concatUint8Arrays} from "../utils/concat";
import {Cypher} from "../accounts/Cypher";
import {ECDSA} from "../accounts/ecdsa/ECDSA";

export default class Event {
	/** Meta type of the data */
	public mediaType: string;

	/** Data of the event */
	public data: IBinary;

	/** Time when the event was signed */
	public timestamp: number;

	/** Hash to the previous event */
	public previous: IBinary;

	/** The type of the public/private key */
	public keyType: string;

	/** Public key used to sign the event */
	public signkey?: IBinary;

	/** Signature of the event */
	public signature?: IBinary;

	/** Hash (see dynamic property) */
	private _hash?: IBinary;

	constructor(data: any, mediaType?: string, previous?: string|Uint8Array) {
		if (data instanceof Binary) {
			this.mediaType = mediaType ?? "application/octet-stream";
			this.data = data;
		} else {
			if (mediaType && mediaType !== "application/json")
				throw new Error(`Unable to encode data as ${mediaType}`);

			this.mediaType = mediaType ?? "application/json";
			this.data = new Binary(JSON.stringify(data));
		}

		this.previous = typeof previous == "string" ? Binary.fromBase58(previous) : new Binary(previous);
	}

	public get hash(): Binary {
		return this._hash ?? new Binary(this.toBinary()).hash();
	}

	public toBinary(): Uint8Array {
		if (typeof this.data == "undefined")
			throw new Error("Data unknown");

		if (typeof this.signkey == "undefined")
			throw new Error("Sign key not set");

		return concatUint8Arrays(
			this.previous,
			this.signkey,
			Uint8Array.from(convert.longToByteArray(this.timestamp)),
			Uint8Array.from(convert.stringToByteArray(this.mediaType)),
			this.data,
		);
	}

	public get subject(): Binary {
		return this.signature.hash();
	}

	private get cypher(): Cypher {
		switch (this.keyType) {
		case "ed25519":
			return new ED25519({publicKey: this.signkey});
		case "secp256k1":
			return new ECDSA("secp256k1", {publicKey: this.signkey});
		case "secp256r1":
			return new ECDSA("secp256r1", {publicKey: this.signkey});
		default:
			throw Error(`Unsupported key type ${this.keyType}`);
		}
	}

	public verifySignature(): boolean {
		if (!this.signature || !this.signkey) {
			throw new Error(`Event ${this.hash} is not signed`);
		}

		return this.cypher.verifySignature(this.toBinary(), this.signature);
	}

	public signWith(account: ISigner): this {
		if (!this.timestamp) this.timestamp = Date.now();
		this.keyType = account.keyType;
		this.signkey = Binary.fromBase58(account.publicKey);
		this.signature = account.sign(this.toBinary());
		this._hash = this.hash;

		return this;
	}

	public addTo(chain: EventChain): this {
		chain.add(this);
		return this;
	}

	public isSigned(): boolean {
		return !!this.signature;
	}

	public get parsedData() {
		if (!this.mediaType.startsWith("application/json")) {
			throw new Error(`Unable to parse data with media type "${this.mediaType}"`);
		}

		return JSON.parse(this.data.toString());
	}

	public toJSON(): IEventJSON {
		return {
			timestamp: this.timestamp,
			previous: this.previous.base58,
			signkey: this.signkey?.base58,
			signature: this.signature?.base58,
			hash: this.signkey ? this.hash.base58 : undefined,
			mediaType: this.mediaType,
			data: "base64:" + this.data.base64,
		};
	}

	public static from(data: IEventJSON): Event {
		const event = Object.create(Event);

		event.timestamp = data.timestamp;
		event.previous = Binary.fromBase58(data.previous);
		if (data.signkey) event.signkey = Binary.fromBase58(data.signkey);
		if (data.signature) event.signature = Binary.fromBase58(data.signature);
		if (data.hash) event._hash = Binary.fromBase58(data.hash);

		event.mediaType = data.mediaType;
		event.data = typeof data.data === "string" && data.data.startsWith("base64:")
			? Binary.fromBase64(data.data.substr(7))
			: new Binary(data.data);

		return event;
	}
}
