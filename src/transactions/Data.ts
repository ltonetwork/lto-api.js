import Transaction from "./Transaction";
import {concatByteArray, strToBytes} from "../utils/byte-array";
import base58 from "../libs/base58";
import * as convert from "../utils/convert";
import {keyTypeId} from "../utils/crypto";
import {IHash, ITxJSON} from "../../interfaces";
import {default as DataEntry, dictToData} from "./DataEntry";
import Binary from "../Binary";

const BASE_FEE = 50000000;
const VAR_FEE = 10000000;
const VAR_BYTES = 256;
const DEFAULT_VERSION = 3;

export default class Data extends Transaction {
	public static readonly TYPE = 12;

	public data: DataEntry[] = [];

	constructor(data: IHash<number|boolean|string|Uint8Array>|DataEntry[]) {
		super(Data.TYPE, DEFAULT_VERSION);

		this.data = Array.isArray(data) ? data : dictToData(data);
		this.fee = BASE_FEE + Math.ceil(this.dataToBinary().length / VAR_BYTES) * VAR_FEE;
	}

	private dataToBinary(): Uint8Array {
		return this.data.reduce(
			(binary: Uint8Array, entry: DataEntry) => concatByteArray(binary, entry.toBinary()),
			new Uint8Array
		);
	}

	private toBinaryV3(): Uint8Array {
		return concatByteArray(
			Uint8Array.from([this.type, this.version]),
			Uint8Array.from(strToBytes(this.chainId)),
			Uint8Array.from(convert.longToByteArray(this.timestamp)),
			Uint8Array.from([keyTypeId(this.senderKeyType)]),
			base58.decode(this.senderPublicKey),
			Uint8Array.from(convert.longToByteArray(this.fee)),
			Uint8Array.from(convert.shortToByteArray(this.data.length)),
			this.dataToBinary()
		);
	}

	public toBinary(): Uint8Array {
		if (!this.sender) throw Error("Transaction sender not set");

		switch (this.version) {
		case 3:  return this.toBinaryV3();
		default: throw new Error("Incorrect version");
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
			data: this.data.map(entry => entry.toJSON()),
			proofs: this.proofs,
			height: this.height
		};
	}

	public get dict(): IHash<number|boolean|string|Binary> {
		const dictionary: IHash<number|boolean|string|Binary> = {};
		this.data.forEach(entry => dictionary[entry.key] = entry.value);
		return dictionary;
	}

	public static from(data: ITxJSON): Data {
		const tx = new Data([]).initFrom(data);
		tx.data = (data.data ?? []).map(DataEntry.from);

		return tx;
	}
}
