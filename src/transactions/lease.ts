import { Transaction } from "./Transaction";
import { concatUint8Arrays } from "../utils/concat";
import base58 from "../libs/base58";
import convert from "../utils/convert";
import crypto from "../utils/crypto";

export { Lease };

const TYPE = 8;
const DEFAULT_FEE = 100000000;
const DEFAULT_VERSION = 3;

class Lease extends Transaction {

	recipient: string;
	amount: number;
	txFee: number;
	version: number;
	id: string;
	height: string;
	type: number;

	constructor(recipient: string, amount: number) {
		super();
		this.recipient = recipient;
		this.amount = amount;
		this.type = TYPE;
		this.txFee = DEFAULT_FEE;
		this.version = DEFAULT_VERSION;
	}

	toBinaryV2() {
		return concatUint8Arrays(
			Uint8Array.from([this.type]),
			Uint8Array.from([this.version]),
			Uint8Array.from([0]),
			base58.decode(this.senderPublicKey),
			base58.decode(this.recipient),
			Uint8Array.from(convert.longToByteArray(this.amount)),
			Uint8Array.from(convert.longToByteArray(this.txFee)),
			Uint8Array.from(convert.longToByteArray(this.timestamp))
		);
	}

	toBinaryV3() {
		return concatUint8Arrays(
			Uint8Array.from([this.type]),
			Uint8Array.from([this.version]),
			Uint8Array.from(crypto.strToBytes(this.chainId)),
			Uint8Array.from(convert.longToByteArray(this.timestamp)),
			Uint8Array.from([crypto.keyTypeId(this.senderKeyType)]),
			base58.decode(this.senderPublicKey),
			Uint8Array.from(convert.longToByteArray(this.txFee)),
			base58.decode(this.recipient),
			Uint8Array.from(convert.longToByteArray(this.amount)),
		);
	}

	toBinary() {
		switch (this.version) {
		case 2:
			return this.toBinaryV2();
		case 3:
			return this.toBinaryV3();
		default:
			console.error("Incorrect version");
		}
	}

	toJson() {
		return (Object.assign({},
			{
				"type": this.type,
				"version": this.version,
				"sender": this.sender,
				"senderKeyType": this.senderKeyType,
				"senderPublicKey": this.senderPublicKey,
				"fee": this.txFee,
				"timestamp": this.timestamp,
				"amount": this.amount,
				"recipient": this.recipient,
				"proofs": this.proofs
			}, this.sponsorJson()));
	}

	fromData(data) {
		const tx = new Lease(data.recipient, data.amount);
		tx.type = data.type;
		tx.id = data.id ?? "";
		tx.version = data.version;
		tx.sender = data.sender ?? "";
		tx.senderKeyType = data.senderKeyType ?? "ed25519";
		tx.senderPublicKey = data.senderPublicKey;
		tx.txFee = data.fee ?? data.txFee;
		tx.timestamp = data.timestamp;
		tx.amount = data.amount;
		tx.recipient = data.recipient;
		tx.proofs = data.proofs ?? [];
		tx.height = data.height ?? "";
		if ("sponsorPublicKey" in data) {
			tx.sponsor = data.sponsor;
			tx.sponsorPublicKey = data.sponsorPublicKey;
		}
		return tx;
	}

}



