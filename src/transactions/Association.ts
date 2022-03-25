import Transaction from "./Transaction";
import {concatUint8Arrays} from "../utils/concat";
import base58 from "../libs/base58";
import * as convert from "../utils/convert";
import * as crypto from "../utils/crypto";
import {ITxJSON} from "../../interfaces";
import Binary from "../Binary";

const DEFAULT_FEE = 100000000;
const DEFAULT_VERSION = 3;

export default class Association extends Transaction {
	public static readonly TYPE = 16;

	public recipient: string;
	public associationType: number;
	public hash?: Binary;
	public expires?: number;

	constructor(recipient, associationType, hash?: Uint8Array, expires?: number|Date) {
		super(Association.TYPE, DEFAULT_VERSION, DEFAULT_FEE);

		this.recipient = recipient;
		this.associationType = associationType;
		if (hash) this.hash = new Binary(hash);
		this.expires = expires instanceof Date ? expires.getTime() : expires;
	}

	private toBinaryV1(): Uint8Array {
		const hashData = this.hash
			? concatUint8Arrays(
				Uint8Array.from([1]),
				Uint8Array.from(convert.shortToByteArray(this.hash.length)),
				this.hash,
			)
			: Uint8Array.from([0]);

		return concatUint8Arrays(
			Uint8Array.from([this.type, this.version]),
			Uint8Array.from(crypto.strToBytes(this.chainId)),
			base58.decode(this.senderPublicKey),
			base58.decode(this.recipient),
			Uint8Array.from(convert.integerToByteArray(this.associationType)),
			hashData,
			Uint8Array.from(convert.longToByteArray(this.timestamp)),
			Uint8Array.from(convert.longToByteArray(this.fee))
		);
	}

	private toBinaryV3(): Uint8Array {
		return concatUint8Arrays(
			Uint8Array.from([this.type, this.version]),
			Uint8Array.from(crypto.strToBytes(this.chainId)),
			Uint8Array.from(convert.longToByteArray(this.timestamp)),
			Uint8Array.from([crypto.keyTypeId(this.senderKeyType)]),
			base58.decode(this.senderPublicKey),
			Uint8Array.from(convert.longToByteArray(this.fee)),
			base58.decode(this.recipient),
			Uint8Array.from(convert.integerToByteArray(this.associationType)),
			Uint8Array.from(convert.longToByteArray(this.expires ?? 0)),
			Uint8Array.from(convert.shortToByteArray(this.hash?.length ?? 0)),
			this.hash ?? new Uint8Array()
		);
	}

	public toBinary(): Uint8Array {
		if (!this.sender) throw Error("Transaction sender not set");

		switch (this.version) {
		case 1:  return this.toBinaryV1();
		case 3:  return this.toBinaryV3();
		default: throw Error("Incorrect version");
		}
	}

	public toJSON(): ITxJSON {
		return {
			id: this.id,
			type: this.type,
			version: this.version,
			sender: this.sender,
			senderKeyType: this.senderKeyType,
			senderPublicKey: this.senderPublicKey,
			sponsor: this.sponsor,
			sponsorKeyType: this.sponsorKeyType,
			sponsorPublicKey: this.sponsorPublicKey,
			recipient: this.recipient,
			associationType: this.associationType,
			expires: this.expires,
			fee: this.fee,
			timestamp: this.timestamp,
			hash: this.hash?.base58,
			proofs: this.proofs,
			height: this.height
		};
	}

	public static from(data: ITxJSON): Association {
		return new Association(data.recipient, data.associationType, Binary.fromBase58(data.hash), data.expires)
			.initFrom(data);
	}
}
