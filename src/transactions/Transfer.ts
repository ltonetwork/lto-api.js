import Transaction from "./Transaction";
import { concatUint8Arrays } from "../utils/concat";
import base58 from "../libs/base58";
import * as convert from "../utils/convert";
import * as crypto from "../utils/crypto";
import {ISigner, ITxJSON} from "../../interfaces";
import Binary from "../Binary";

const DEFAULT_FEE = 100000000;
const DEFAULT_VERSION = 3;

export default class Transfer extends Transaction {
	public static readonly TYPE = 4;

	public recipient: string;
	public amount: number;
	public attachment: Binary;

	constructor(recipient: string|ISigner, amount: number, attachment: Uint8Array|string = "") {
		super(Transfer.TYPE, DEFAULT_VERSION, DEFAULT_FEE);

		this.recipient = typeof recipient === "string" ? recipient : recipient.address;
		this.amount = amount;
		this.attachment = new Binary(attachment);
	}

	private toBinaryV2(): Uint8Array {
		return concatUint8Arrays(
			Uint8Array.from([this.type, this.version]),
			base58.decode(this.senderPublicKey),
			Uint8Array.from(convert.longToByteArray(this.timestamp)),
			Uint8Array.from(convert.longToByteArray(this.amount)),
			Uint8Array.from(convert.longToByteArray(this.fee)),
			base58.decode(this.recipient),
			Uint8Array.from(convert.shortToByteArray(this.attachment.length)),
			this.attachment
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
			Uint8Array.from(convert.longToByteArray(this.amount)),
			Uint8Array.from(convert.shortToByteArray(this.attachment.length)),
			this.attachment
		);
	}

	public toBinary(): Uint8Array {
		if (!this.sender) throw Error("Transaction sender not set");

		switch (this.version) {
		case 2:  return this.toBinaryV2();
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
			fee: this.fee,
			timestamp: this.timestamp,
			amount: this.amount,
			recipient: this.recipient,
			attachment: this.attachment.base58,
			proofs: this.proofs,
			height: this.height
		};
	}

	public static from(data: ITxJSON): Transfer {
		const attachment = data.attachment ? Binary.fromBase58(data.attachment) : "";
		return new Transfer(data.recipient, data.amount, attachment).initFrom(data);
	}
}
