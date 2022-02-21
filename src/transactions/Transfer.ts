import Transaction from "./Transaction";
import { concatUint8Arrays } from "../utils/concat";
import base58 from "../libs/base58";
import * as convert from "../utils/convert";
import * as crypto from "../utils/crypto";
import {ITxJSON} from "../../interfaces";
import Binary from "../Binary";

const DEFAULT_FEE = 100000000;
const DEFAULT_VERSION = 3;

export default class Transfer extends Transaction {
	public static readonly TYPE = 4;

	public recipient: string;
	public amount: number;
	public attachment?: Binary;

	constructor(recipient: string, amount: number, attachment?: Uint8Array|string) {
		super(Transfer.TYPE, DEFAULT_VERSION, DEFAULT_FEE);

		this.recipient = recipient;
		this.amount = amount;

		if (attachment) this.attachment = new Binary(attachment);
	}

	private toBinaryV2(): Uint8Array {
		const attachmentBinary = base58.decode(this.attachment);

		return concatUint8Arrays(
			Uint8Array.from([this.type, this.version]),
			base58.decode(this.senderPublicKey),
			Uint8Array.from(convert.longToByteArray(this.timestamp)),
			Uint8Array.from(convert.longToByteArray(this.amount)),
			Uint8Array.from(convert.longToByteArray(this.fee)),
			base58.decode(this.recipient),
			Uint8Array.from(convert.shortToByteArray(attachmentBinary.length)),
			Uint8Array.from(attachmentBinary)
		);
	}

	private toBinaryV3(): Uint8Array {
		const attachmentBinary = base58.decode(this.attachment);

		return concatUint8Arrays(
			Uint8Array.from([this.type, this.version]),
			Uint8Array.from(crypto.strToBytes(this.chainId)),
			Uint8Array.from(convert.longToByteArray(this.timestamp)),
			Uint8Array.from([crypto.keyTypeId(this.senderKeyType)]),
			base58.decode(this.senderPublicKey),
			Uint8Array.from(convert.longToByteArray(this.fee)),
			base58.decode(this.recipient),
			Uint8Array.from(convert.longToByteArray(this.amount)),
			Uint8Array.from(convert.shortToByteArray(attachmentBinary.length)),
			Uint8Array.from(attachmentBinary)
		);
	}

	public toBinary(): Uint8Array {
		switch (this.version) {
			case 2:  return this.toBinaryV2();
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
				fee: this.fee,
				timestamp: this.timestamp,
				amount: this.amount,
				recipient: this.recipient,
				attachment: this.attachment,
				proofs: this.proofs,
				height: this.height
			},
			this.sponsorJson()
		);
	}

	public static from(data: ITxJSON): Transfer {
		return new Transfer(data.recipient, data.amount, Binary.fromBase58(data.attachment))
			.initFrom(data);
	}
}
