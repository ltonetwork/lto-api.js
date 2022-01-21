import { Transaction } from "../Transaction";
import { concatUint8Arrays } from "../../utils/concat";
import base58 from "../../libs/base58";
import convert from "../../utils/convert";
import crypto from "../../utils/crypto";
import encoder from "../../utils/encoder";
import { Account } from "../Account";

export { Register };

const TYPE = 20;
const DEFAULT_FEE = 35000000;
const DEFAULT_VERSION = 3;

class Register extends Transaction {
	accounts: any;
	txFee: number;
	version: number;
	id: string;
	height: string;
	type: number;

	constructor(...accounts: any[]) {
		super();
		this.accounts = accounts.map(this.accountToDict);

		this.type = TYPE;
		this.txFee = DEFAULT_FEE;
		this.version = DEFAULT_VERSION;

		if (this.accounts.length > 100)
			throw new Error('Too many accounts');
		
	}

	accountToDict(account){
		if (account instanceof Account){
			return {'keyType': account.keyType, 'publicKey': account.getPublicVerifyKey()}}
		else
			return account
	}

	accountToData(){
		let data = new Uint8Array;
		for (let i=0; i < this.accounts.length; i++){
			data = concatUint8Arrays(data, 
			Uint8Array.from(convert.shortToByteArray(crypto.keyTypeId(this.accounts[i].keyType))),
			encoder.decode(this.accounts[i].publicKey));
		}
		return data;
	}

	accountToJson(account){
		return {'keyType': account.keyType, 'publicKey': account.publicKey}
	}

	accountFromData(data){
		return {'keyType': data.keyType, 'publicKey': data.publicKey}
	}

	toBinaryV3() {
		return concatUint8Arrays(Uint8Array.from([this.type]),
			Uint8Array.from([this.version]),
			Uint8Array.from(crypto.strToBytes(this.chainId)),
			Uint8Array.from(convert.longToByteArray(this.timestamp)),
			Uint8Array.from(convert.shortToByteArray(crypto.keyTypeId(this.senderKeyType))),
			base58.decode(this.senderPublicKey),
			Uint8Array.from(convert.longToByteArray(this.txFee)),
			Uint8Array.from(convert.shortToByteArray(this.accounts.length)),
			this.accountToData()
			);
	}

	toBinary() {
		switch (this.version) {
		case 3:
			return this.toBinaryV3();
		default:
			console.error("Incorrect Version: ", this.version);
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
			accounts: this.accounts.map(this.accountToJson),
			proofs: this.proofs,
		},
		this.sponsorJson());
	}

	fromData(data) {
		const tx = new Register();
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
		tx.accounts = data.accounts.map(this.accountFromData);

		if ("sponsorPublicKey" in data) {
			tx.sponsor = data.sponsor;
			tx.sponsorPublicKey = data.sponsorPublicKey;
		}
		return tx;
	}
}
