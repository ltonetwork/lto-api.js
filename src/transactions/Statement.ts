import Transaction from "./Transaction";
import {concatBytes, strToBytes} from "../utils/bytes";
import base58 from "../libs/base58";
import * as convert from "../utils/convert";
import {keyTypeId} from "../utils/crypto";
import {IHash, ISigner, ITxJSON} from "../../interfaces";
import Binary from "../Binary";
import {default as DataEntry, dictToData} from "./DataEntry";

const BASE_FEE = 50000000;
const VAR_FEE = 10000000;
const VAR_BYTES = 256;
const DEFAULT_VERSION = 3;

export default class Statement extends Transaction {
	public static readonly TYPE = 23;

	public statementType: number;
	public recipient?: string;
	public subject?: Binary;
	public data: DataEntry[] = [];

	constructor(
		statementType: number,
		recipient: string|ISigner,
		subject?: Uint8Array,
		data: IHash<number|boolean|string|Uint8Array>|DataEntry[] = []
	) {
		super(Statement.TYPE, DEFAULT_VERSION);

		this.statementType = statementType;
		this.recipient = typeof recipient === "string" ? recipient : recipient.address;
		if (subject) this.subject = new Binary(subject);

		this.data = Array.isArray(data) ? data : dictToData(data);
		this.fee = BASE_FEE + Math.ceil(this.dataToBinary().length / VAR_BYTES) * VAR_FEE;
	}

	private dataToBinary(): Uint8Array {
		return this.data.reduce(
			(binary: Uint8Array, entry: DataEntry) => concatBytes(binary, entry.toBinary()),
			new Uint8Array
		);
	}

	private toBinaryV3(): Uint8Array {
		return concatBytes(
			Uint8Array.from([this.type, this.version]),
			convert.stringToByteArray(this.chainId),
			convert.longToByteArray(this.timestamp),
			Uint8Array.from([keyTypeId(this.senderKeyType)]),
			base58.decode(this.senderPublicKey),
			convert.longToByteArray(this.fee),
			convert.longToByteArray(this.statementType),
			Uint8Array.from([this.recipient ? 1 : 0]),
			this.recipient ? base58.decode(this.recipient) : new Uint8Array(),
			convert.shortToByteArray(this.subject?.length ?? 0),
			this.subject ?? new Uint8Array(),
			convert.shortToByteArray(this.data.length),
			this.dataToBinary()
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
			associationType: this.statementType,
			recipient: this.recipient,
			subject: this.subject?.base58,
			data: this.data?.map(entry => entry.toJSON()),
			proofs: this.proofs,
			height: this.height
		};
	}

	public get dict(): IHash<number|boolean|string|Binary> {
		const dictionary: IHash<number|boolean|string|Binary> = {};
		this.data.forEach(entry => dictionary[entry.key] = entry.value);
		return dictionary;
	}

	public static from(data: ITxJSON): Statement {
		const tx = new Statement(
			data.associationType,
			data.recipient,
			data.subject ? Binary.fromBase58(data.subject) : null,
		).initFrom(data);

		tx.data = (data.data ?? []).map(DataEntry.from);

		return tx;
	}
}
