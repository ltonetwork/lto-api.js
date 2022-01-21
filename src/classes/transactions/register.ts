import { Transaction } from "../Transaction";
import { concatUint8Arrays } from "../../utils/concat";
import base58 from "../../libs/base58";
import convert from "../../utils/convert";
import crypto from "../../utils/crypto";
import { Account } from "../Account";

export { Register };

const TYPE = 20;
const DEFAULT_FEE = 35000000;
const DEFAULT_VERSION = 3;

class Register extends Transaction {
	accounts: Array<object>;
	txFee: number;
	version: number;
	id: string;
	height: string;
	type: number;

	constructor(...accounts: any[]) {
		super();
		this.accounts = accounts;
		this.type = TYPE;
		this.txFee = DEFAULT_FEE;
		this.version = DEFAULT_VERSION;

		if (this.accounts.length > 100)
			throw new Error('Too many accounts');
	}

	accountToDict(account){
		if (account instanceof Account)
			return {'key_type': account.keyType, 'public_key': account.getPublicVerifyKey()}
		else
			return account
	}

	accountToData(){
		let data;
		for (let i = 0; i < this.accounts.length; i++){
			data
		}
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
			Uint8Array.from([1]),
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
