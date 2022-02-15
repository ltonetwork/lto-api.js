import Transaction from "./Transaction";
import { concatUint8Arrays } from "../utils/concat";
import base58 from "../libs/base58";
import convert from "../utils/convert";
import crypto from "../utils/crypto";
import {ITxJSON} from "../interfaces";

const TYPE = 18;
const DEFAULT_FEE = 500000000;
const DEFAULT_VERSION = 3;

export default class Sponsorship extends Transaction {
	public recipient: string;

	constructor(recipient: string) {
		super(TYPE, DEFAULT_VERSION, DEFAULT_FEE);
		this.recipient = recipient;
	}

	private toBinaryV1(): Uint8Array {
		return concatUint8Arrays(
			Uint8Array.from([this.type, this.version]),
			Uint8Array.from(crypto.strToBytes(this.chainId)),
			base58.decode(this.senderPublicKey),
			base58.decode(this.recipient),
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
			base58.decode(this.recipient)
		);
	}

	public toBinary(): Uint8Array {
		switch (this.version) {
			case 1:  return this.toBinaryV1();
			case 3:  return this.toBinaryV3();
			default: throw Error("Incorrect version");
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
				recipient: this.recipient,
				timestamp: this.timestamp,
				fee: this.fee,
				proofs: this.proofs,
				height: this.height
			},
			this.sponsorJson()
		);
	}

	public static fromData(data: ITxJSON): Sponsorship {
		return new Sponsorship(data.recipient).initFromData(data)
	}
}