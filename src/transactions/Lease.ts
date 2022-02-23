import Transaction from "./Transaction";
import { concatUint8Arrays } from "../utils/concat";
import base58 from "../libs/base58";
import * as convert from "../utils/convert";
import * as crypto from "../utils/crypto";
import {ITxJSON} from "../../interfaces";

const DEFAULT_FEE = 100000000;
const DEFAULT_VERSION = 3;

export default class Lease extends Transaction {
	public static readonly TYPE = 8;

	public recipient: string;
	public amount: number;

	constructor(recipient: string, amount: number) {
		super(Lease.TYPE, DEFAULT_VERSION, DEFAULT_FEE);
		this.recipient = recipient;
		this.amount = amount;
	}

	private toBinaryV2(): Uint8Array {
		return concatUint8Arrays(
			Uint8Array.from([this.type, this.version, 0]),
			base58.decode(this.senderPublicKey),
			base58.decode(this.recipient),
			Uint8Array.from(convert.longToByteArray(this.amount)),
			Uint8Array.from(convert.longToByteArray(this.fee)),
			Uint8Array.from(convert.longToByteArray(this.timestamp))
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
		);
	}

	public toBinary(): Uint8Array {
		if (!this.sender) throw Error("Transaction sender not set");

		switch (this.version) {
			case 2:  return this.toBinaryV2();
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
			fee: this.fee,
			timestamp: this.timestamp,
			recipient: this.recipient,
			amount: this.amount,
			proofs: this.proofs,
			height: this.height
		};
	}

	static from(data: ITxJSON): Lease {
		return new Lease(data.recipient, data.amount).initFrom(data);
	}
}
