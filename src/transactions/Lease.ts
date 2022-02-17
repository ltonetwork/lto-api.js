import Transaction from "./Transaction";
import { concatUint8Arrays } from "../utils/concat";
import base58 from "../libs/base58";
import * as convert from "../utils/convert";
import * as crypto from "../utils/crypto";
import {ITxJSON} from "../../interfaces";

const TYPE = 8;
const DEFAULT_FEE = 100000000;
const DEFAULT_VERSION = 3;

export default class Lease extends Transaction {
	public recipient: string;
	public amount: number;

	constructor(recipient: string, amount: number) {
		super(TYPE, DEFAULT_VERSION, DEFAULT_FEE);
		this.recipient = recipient;
		this.amount = amount;
	}

	private toBinaryV2(): Uint8Array {
		return concatUint8Arrays(
			Uint8Array.from([this.type, this.version]),
			Uint8Array.from([0]),
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
		switch (this.version) {
			case 2:  return this.toBinaryV2();
			case 3:  return this.toBinaryV3();
			default: throw new Error("Incorrect version");
		}
	}

	public toJson(): ITxJSON {
		return Object.assign(
			{
				id: this.id,
				type: this.type,
				version: this.version,
				sender: this.sender,
				senderKeyType: this.senderKeyType,
				senderPublicKey: this.senderPublicKey,
				fee: this.fee,
				timestamp: this.timestamp,
				amount: this.amount,
				recipient: this.recipient,
				proofs: this.proofs,
				height: this.height
			},
			this.sponsorJson()
		);
	}

	static fromData(data: ITxJSON): Lease {
		return new Lease(data.recipient, data.amount).initFromData(data);
	}
}
