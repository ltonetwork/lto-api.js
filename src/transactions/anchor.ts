import { Transaction } from "./Transaction";
import { concatUint8Arrays } from "../utils/concat";
import base58 from "../libs/base58";
import convert from "../utils/convert";
import crypto from "../utils/crypto";

export { Anchor };

const TYPE = 15;
const DEFAULT_FEE = 35000000;
const DEFAULT_VERSION = 3;

class Anchor extends Transaction {
	anchor: any;
	txFee: number;
	version: number;
	id: string;
	height: string;
	type: number;

	constructor(anchor: any) {
		super();
		this.anchor = anchor;
		this.type = TYPE;
		this.txFee = DEFAULT_FEE;
		this.version = DEFAULT_VERSION;
	}

	toBinaryV1() {
		return concatUint8Arrays(Uint8Array.from([this.type]),
			Uint8Array.from([this.version]),
			base58.decode(this.senderPublicKey),
			Uint8Array.from(convert.shortToByteArray(1)),
			Uint8Array.from(convert.shortToByteArray(this.anchor.length)),
			Uint8Array.from(convert.stringToByteArray(this.anchor)),
			Uint8Array.from(convert.longToByteArray(this.timestamp)),
			Uint8Array.from(convert.longToByteArray(this.txFee)));
	}

	toBinaryV3() {
		return concatUint8Arrays(Uint8Array.from([this.type]),
			Uint8Array.from([this.version]),
			Uint8Array.from(crypto.strToBytes(this.chainId)),
			Uint8Array.from(convert.longToByteArray(this.timestamp)),
			Uint8Array.from([crypto.keyTypeId(this.senderKeyType)]),
			base58.decode(this.senderPublicKey),
			Uint8Array.from(convert.longToByteArray(this.txFee)),
			Uint8Array.from(convert.shortToByteArray(1)),
			Uint8Array.from(convert.shortToByteArray(this.anchor.length)),
			Uint8Array.from(convert.stringToByteArray(this.anchor)));
	}

	toBinary() {
		switch (this.version) {
		case 1:
			return this.toBinaryV1();
		case 3:
			return this.toBinaryV3();
		default:
			console.error("Incorrect version");
		}
	}

	toJson() {
		return Object.assign({
		},
		{
			type: this.type,
			version: this.version,
			sender: this.sender,
			senderKeyType: this.senderKeyType,
			senderPublicKey: this.senderPublicKey,
			fee: this.txFee,
			timestamp: this.timestamp,
			anchors: [base58.encode(crypto.strToBytes(this.anchor))],
			proofs: this.proofs,
		},
		this.sponsorJson());
	}

	fromData(data) {
		const tx = new Anchor(data.anchors);
		tx.anchor = data.anchor;
		tx.type = data.type;
		tx.version = data.version;
		tx.id = data.id ?? "";
		tx.sender = data.sender ?? "";
		tx.senderKeyType = data.senderKeyType ?? "ed25519";
		tx.senderPublicKey = data.senderPublicKey;
		tx.txFee = data.fee ?? data.txFee;
		tx.timestamp = data.timestamp;
		tx.proofs = data.proofs ?? [];
		tx.height = data.height ?? "";

		if ("sponsorPublicKey" in data) {
			tx.sponsor = data.sponsor;
			tx.sponsorPublicKey = data.sponsorPublicKey;
		}
		return tx;
	}
}
