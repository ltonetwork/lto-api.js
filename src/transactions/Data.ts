import Transaction from "./Transaction";
import {concatUint8Arrays} from "../utils/concat";
import base58 from "../libs/base58";
import * as convert from "../utils/convert";
import * as crypto from "../utils/crypto";
import {ITxJSON} from "../../interfaces";
import DataEntry from "./DataEntry";

const BASE_FEE = 100000000
const VAR_FEE = 10000000
const VAR_BYTES = 256
const DEFAULT_VERSION = 3;

export default class Data extends Transaction {
    public static readonly TYPE = 12;

    public data: DataEntry[] = [];

    constructor(data: {[_: string]: any}|DataEntry[]) {
        super(Data.TYPE, DEFAULT_VERSION);
        this.fee = BASE_FEE + Math.ceil((this.dataToBinary().length / VAR_BYTES)) * VAR_FEE;

        this.data = Array.isArray(data) ? data : Data.dictToData(data);
    }

    public static dictToData(dictionary: {[_: string]: any}): DataEntry[] {
        const data: Array<DataEntry> = [];

        for (const key in dictionary) {
            data.push(DataEntry.guess(key, dictionary[key]));
        }

        return data;
    }

    private dataToBinary(): Uint8Array {
        return this.data.reduce(
            (binary: Uint8Array, entry: DataEntry) => concatUint8Arrays(binary, entry.toBinary()),
            new Uint8Array
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

    /**
     * Get data as dictionary.
     */
    public get dict(): {[_: string]: any} {
        const dictionary = {};
        this.data.forEach(entry => dictionary[entry.key] = entry.value);
        return dictionary;
    }

    public static from(data: ITxJSON): Data {
        const tx = new Data([]).initFrom(data);
        tx.data = (data.data ?? []).map(DataEntry.from);

        return tx;
    }
}
