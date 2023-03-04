import Transaction from "./Transaction";
import {concatBytes} from "../utils/bytes";
import * as base58 from "../libs/base58";
import * as convert from "../utils/convert";
import {keyTypeId} from "../utils/crypto";
import {ISigner, ITxJSON} from "../../interfaces";
import Binary from "../Binary";

const DEFAULT_FEE = 50000000;
const DEFAULT_VERSION = 3;

export default class RevokeAssociation extends Transaction {
	public static readonly TYPE = 17;

	public recipient: string;
	public associationType: number;
	public subject?: Binary;

	constructor(associationType: number, recipient: string|ISigner, subject?: Uint8Array) {
		super(RevokeAssociation.TYPE, DEFAULT_VERSION, DEFAULT_FEE);

		this.recipient = typeof recipient === "string" ? recipient : recipient.address;
		this.associationType = associationType;
		if (subject) this.subject = new Binary(subject);
	}

	private toBinaryV1(): Uint8Array {
		const hashBytes = this.subject
			? concatBytes(
				Uint8Array.from([1]),
				convert.shortToByteArray(this.subject.length),
				Uint8Array.from(this.subject),
			)
			: Uint8Array.from([0]);

		return concatBytes(
			Uint8Array.from([this.type, this.version]),
			convert.stringToByteArray(this.chainId),
			base58.decode(this.senderPublicKey!),
			base58.decode(this.recipient),
			convert.integerToByteArray(this.associationType),
			hashBytes,
			convert.longToByteArray(this.timestamp!),
			convert.longToByteArray(this.fee)
		);
	}

	private toBinaryV3(): Uint8Array {
		return concatBytes(
			Uint8Array.from([this.type, this.version]),
			convert.stringToByteArray(this.chainId),
			convert.longToByteArray(this.timestamp!),
			Uint8Array.from([keyTypeId(this.senderKeyType)]),
			base58.decode(this.senderPublicKey!),
			convert.longToByteArray(this.fee),
			base58.decode(this.recipient),
			convert.integerToByteArray(this.associationType),
			convert.shortToByteArray(this.subject?.length ?? 0),
			this.subject ?? new Uint8Array()
		);
	}

	private toBinaryV4(): Uint8Array {
		return concatBytes(
			Uint8Array.from([this.type, this.version]),
			convert.stringToByteArray(this.chainId),
			convert.longToByteArray(this.timestamp!),
			Uint8Array.from([keyTypeId(this.senderKeyType)]),
			base58.decode(this.senderPublicKey!),
			convert.longToByteArray(this.fee),
			convert.longToByteArray(this.associationType),
			base58.decode(this.recipient),
			convert.shortToByteArray(this.subject?.length ?? 0),
			this.subject ?? new Uint8Array()
		);
	}

	public toBinary(): Uint8Array {
		if (!this.sender) throw Error("Transaction sender not set");

		switch (this.version) {
		case 1:  return this.toBinaryV1();
		case 3:  return this.toBinaryV3();
		default: throw new Error("Incorrect version");
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
			fee: this.fee,
			timestamp: this.timestamp,
			subject: this.subject?.base58,
			proofs: this.proofs,
			height: this.height,
		};
	}

	public static from(data: ITxJSON): RevokeAssociation {
		return new RevokeAssociation(
			data.associationType,
			data.recipient,
			data.subject ? Binary.fromBase58(data.subject) : undefined
		).initFrom(data);
	}
}
