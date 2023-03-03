import Transaction from "./Transaction";
import {concatBytes} from "../utils/bytes";
import * as base58 from "../libs/base58";
import * as convert from "../utils/convert";
import {keyTypeId} from "../utils/crypto";
import {ISigner, ITxJSON} from "../../interfaces";

const DEFAULT_FEE = 500000000;
const DEFAULT_VERSION = 3;

export default class CancelSponsorship extends Transaction {
	public static readonly TYPE = 19;

	public recipient: string;

	constructor(recipient: string|ISigner) {
		super(CancelSponsorship.TYPE, DEFAULT_VERSION, DEFAULT_FEE);
		this.recipient = typeof recipient === "string" ? recipient : recipient.address;
	}

	private toBinaryV1(): Uint8Array {
		return concatBytes(
			Uint8Array.from([this.type, this.version]),
			convert.stringToByteArray(this.chainId),
			base58.decode(this.senderPublicKey),
			base58.decode(this.recipient),
			convert.longToByteArray(this.timestamp),
			convert.longToByteArray(this.fee)
		);
	}

	private toBinaryV3(): Uint8Array {
		return concatBytes(
			Uint8Array.from([this.type, this.version]),
			convert.stringToByteArray(this.chainId),
			convert.longToByteArray(this.timestamp),
			Uint8Array.from([keyTypeId(this.senderKeyType)]),
			base58.decode(this.senderPublicKey),
			convert.longToByteArray(this.fee),
			base58.decode(this.recipient)
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
			timestamp: this.timestamp,
			fee: this.fee,
			proofs: this.proofs,
			height: this.height
		};
	}

	public static from(data: ITxJSON): CancelSponsorship {
		return new CancelSponsorship(data.recipient).initFrom(data);
	}
}
