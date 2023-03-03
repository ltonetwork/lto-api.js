import Transaction from "./Transaction";
import {concatBytes} from "../utils/bytes";
import * as base58 from "../libs/base58";
import * as convert from "../utils/convert";
import {keyTypeId} from "../utils/crypto";
import {ITxJSON} from "../../interfaces";

const DEFAULT_FEE = 100000000;
const DEFAULT_VERSION = 3;

export default class Burn extends Transaction {
	public static readonly TYPE = 21;

	public amount: number;

	constructor(amount: number) {
		super(Burn.TYPE, DEFAULT_VERSION, DEFAULT_FEE);
		this.amount = amount;
	}
	private toBinaryV3(): Uint8Array {
		return concatBytes(
			Uint8Array.from([this.type, this.version]),
			convert.stringToByteArray(this.chainId),
			convert.longToByteArray(this.timestamp),
			Uint8Array.from([keyTypeId(this.senderKeyType)]),
			base58.decode(this.senderPublicKey),
			convert.longToByteArray(this.fee),
			convert.longToByteArray(this.amount),
		);
	}

	public toBinary(): Uint8Array {
		if (!this.sender) throw Error("Transaction sender not set");

		switch (this.version) {
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
			proofs: this.proofs,
			height: this.height
		};
	}

	public static from(data: ITxJSON): Burn {
		return new Burn(data.amount).initFrom(data);
	}
}
