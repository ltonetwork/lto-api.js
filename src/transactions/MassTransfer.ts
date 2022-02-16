import Transaction from "./Transaction";
import { concatUint8Arrays } from "../utils/concat";
import base58 from "../libs/base58";
import * as convert from "../utils/convert";
import * as crypto from "../utils/crypto";
import {ITransfer, ITxJSON} from "../interfaces";

const TYPE = 11;
const BASE_FEE = 100000000;
const VAR_FEE= 10000000;
const DEFAULT_VERSION = 3;

export default class MassTransfer extends Transaction {
	public transfers: ITransfer[];
	public attachment?: string;

	constructor(transfers: ITransfer[], attachment?: Uint8Array|string) {
		super(TYPE, DEFAULT_VERSION, BASE_FEE + (transfers.length * VAR_FEE));
		this.transfers = transfers;

		if (attachment) this.attachment = base58.encode(
			attachment instanceof Uint8Array ? attachment : convert.stringToByteArray(attachment)
		);
	}

	private transferBinary(): Uint8Array {
		return this.transfers.reduce(
			(binary: Uint8Array, transfer: ITransfer) => concatUint8Arrays(
				binary,
				base58.decode(transfer.recipient),
				Uint8Array.from(convert.longToByteArray(transfer.amount))
			), new Uint8Array()
		);
	}

	private toBinaryV1(): Uint8Array {
		return concatUint8Arrays(
			Uint8Array.from([this.type, this.version]),
			base58.decode(this.senderPublicKey),
			Uint8Array.from(convert.shortToByteArray(this.transfers.length)),
			this.transferBinary(),
			Uint8Array.from(convert.longToByteArray(this.timestamp)),
			Uint8Array.from(convert.longToByteArray(this.fee)),
			Uint8Array.from(convert.shortToByteArray(this.attachment.length)),
			Uint8Array.from(convert.stringToByteArray(this.attachment))
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
			Uint8Array.from(convert.shortToByteArray(this.transfers.length)),
			this.transferBinary(),
			Uint8Array.from(convert.shortToByteArray(this.attachment.length)),
			Uint8Array.from(convert.stringToByteArray(this.attachment))
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
				fee: this.fee,
				timestamp: this.timestamp,
				proofs: this.proofs,
				attachment: this.attachment,
				transfers: this.transfers,
				height: this.height
			},
			this.sponsorJson()
		);
	}

	public static fromData(data: ITxJSON): MassTransfer {
		const tx = new MassTransfer(data.transfers).initFromData(data);
		tx.attachment = data.attachment;

		return tx;
	}
}
