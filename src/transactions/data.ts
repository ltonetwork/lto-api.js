import { Transaction } from "./Transaction";
import { concatUint8Arrays } from "../utils/concat";
import base58 from "../libs/base58";
import convert from "../utils/convert";
import crypto from "../utils/crypto";

export { Data };

const TYPE = 12;
const BASE_FEE = 100000000
const VAR_FEE = 10000000
const VAR_BYTES = 256
const DEFAULT_VERSION = 3;

class Data extends Transaction {
	data: DataEntry[];

	constructor(data: object|DataEntry[]) {
		super();
		this.data = Array.isArray(data) ? data : Data.dictToData(data);
		this.type = TYPE;
		this.txFee = BASE_FEE + Math.ceil((this.dataToBinary().length / VAR_BYTES)) * VAR_FEE
		this.version = DEFAULT_VERSION;
	}

	static dictToData(dictionary: object): DataEntry[] {
		let data: Array<DataEntry> = [];
        for (let key in dictionary){
			data.push(DataEntry.guess(key, dictionary[key]))
		}
        return data
	}

	dataToBinary(): Uint8Array{
		let binary = new Uint8Array;
		for (let i = 0; i < this.data.length; i++)
			binary = concatUint8Arrays(binary, this.data[i].toBinary())
		return binary
	}


	toBinaryV3() {
		let dataBinary = this.dataToBinary()
		return concatUint8Arrays(Uint8Array.from([this.type]),
			Uint8Array.from([this.version]),
			Uint8Array.from(crypto.strToBytes(this.chainId)),
			Uint8Array.from(convert.longToByteArray(this.timestamp)),
			Uint8Array.from([crypto.keyTypeId(this.senderKeyType)]),
			base58.decode(this.senderPublicKey),
			Uint8Array.from(convert.longToByteArray(this.txFee)),
			Uint8Array.from(convert.shortToByteArray(this.data.length)),
			dataBinary
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
		return Object.assign({},
		{
			id: this.id ?? "",
			type: this.type,
			version: this.version,
			sender: this.sender,
			senderKeyType: this.senderKeyType,
			senderPublicKey: this.senderPublicKey,
			fee: this.txFee,
			timestamp: this.timestamp,
			accounts: this.data.map(entry => entry.toJson()),
			proofs: this.proofs,
		},
		this.sponsorJson());
	}

	dataAsDict(): Object{
		let dictionary: Object = {};
		for (let i = 0; i < this.data.length; i++)
			dictionary[this.data[i].key] = this.data[i].value;
		return dictionary
	}

	fromData(data): Transaction {
		const tx = new Data([]);
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
		tx.data = data.data.map(DataEntry.fromData) ?? [];

		if ("sponsorPublicKey" in data) {
			tx.sponsor = data.sponsor;
			tx.sponsorPublicKey = data.sponsorPublicKey;
		}
		return tx;
	}
}

export { DataEntry };

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
			case 'integer':
				return concatUint8Arrays(Uint8Array.from([0]), Uint8Array.from(convert.integerToByteArray(this.value)))
			case 'boolean':
				return concatUint8Arrays(Uint8Array.from([1]), Uint8Array.from([+this.value])) 
			case 'binary':
				return concatUint8Arrays(Uint8Array.from([2]), this.value)
			case 'string':
				return concatUint8Arrays(Uint8Array.from([3]), Uint8Array.from(convert.stringToByteArray(this.value)))
			default:
				throw Error("Unrecognized type");
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
				return new DataEntry(key, 'binary', value);
			default:
				throw Error("Type not recognized");
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
