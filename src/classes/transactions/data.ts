import { Transaction } from "../Transaction";
import { concatUint8Arrays } from "../../utils/concat";
import base58 from "../../libs/base58";
import convert from "../../utils/convert";
import crypto from "../../utils/crypto";
import encoder from "../../utils/encoder";
import { Account } from "../Account";
import { data } from "@lto-network/lto-transactions";

export { Data };

const TYPE = 12;
const BASE_FEE = 100000000
const VAR_FEE = 10000000
const VAR_BYTES = 256
const DEFAULT_VERSION = 3;

class Data extends Transaction {
	data: any;
	txFee: number;
	version: number;
	id: string;
	height: string;
	type: number;

	constructor(data: object|DataEntry[]) {
		super();
		this.data = Array.isArray(data) ? data : Data.dictToData(data);

		this.type = TYPE;
		this.txFee = DEFAULT_FEE;
		this.version = DEFAULT_VERSION;

		if (this.accounts.length > 100)
			throw new Error('Too many accounts');
		
	}

	static dictToData(dictionary){
		let data: Array<Object> = [];
        //for key in dictionary:
		for (let i = 0; i < dictionary.length; i++){
			data.push(DataEntry.guess())
		}
        
            data.append(DataEntry.guess(key, dictionary[key]))
        return data
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
			Uint8Array.from([crypto.keyTypeId(this.senderKeyType)]),
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

	static fromData(data) {
		const tx = new Data();
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

class DataEntry {
	key: string;
	type: string;
	value: any;

	constructor(key: string, type: string, value: any) {
		this.key = key;
		this.type = type;
		this.value = value;
	}	

	toBinary(){
		let keyBytes = Uint8Array.from(convert.stringToByteArray(this.key));
		return concatUint8Arrays(Uint8Array.from(convert.shortToByteArray(keyBytes.length)), 
								keyBytes, this.valueToBinary())
	}

	valueToBinary(){
		switch (this.type){
			case 'integrer':
				return concatUint8Arrays(Uint8Array.from([0]), Uint8Array.from(convert.integerToByteArray(this.value)))
			case 'boolean':
				return concatUint8Arrays(Uint8Array.from([1]), Uint8Array.from([+this.value])) 
			case 'binary':
				return concatUint8Arrays(Uint8Array.from([2]), this.value)
			case 'string':
				return concatUint8Arrays(Uint8Array.from([3]), Uint8Array.from(convert.stringToByteArray(this.value)))
		}
	}

	static fromData(data){
		return new DataEntry(data.key, data.type, data.value)
	}

    static guess(key, value){
		switch(typeof value){
			case 'number':
				return new DataEntry(key, 'integer', value);
			case 'boolean':
				return new DataEntry(key, 'boolean', value);
			case 'string':
				return new DataEntry(key, 'string', value);
			case 'object':
				return new DataEntry(key, 'binary', value)
		}
	}

	toJson(){
		return {
			"key": this.key,
			"type": this.type,
			"value": this.value
		}
	}

}
