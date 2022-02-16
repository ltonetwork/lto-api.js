import Transaction from "./Transaction";
import {concatUint8Arrays} from "../utils/concat";
import base58 from "../libs/base58";
import * as convert from "../utils/convert";
import * as crypto from "../utils/crypto";
import {recode} from "../utils/encoder";
import {Encoding, ITxJSON} from "../interfaces";

const TYPE = 15;
const BASE_FEE = 25000000;
const VAR_FEE = 10000000;
const DEFAULT_VERSION = 3;

export default class Anchor extends Transaction {
    /** Base58 encoded anchor hashes */
    public anchors: string[];

    constructor(anchor?: string, encoding = Encoding.hex) {
        super(TYPE, DEFAULT_VERSION, BASE_FEE + (anchor ? VAR_FEE : 0));

        if (anchor)
            this.anchors.push(recode(anchor, encoding, Encoding.base58));
    }

    public addHex(...anchors: string[]): this {
        this.anchors.concat(...anchors.map(anchor => recode(anchor, Encoding.hex, Encoding.base58)));
        this.fee += anchors.length * VAR_FEE;
        return this;
    }

    public addBase58(...anchors: string[]): this {
        this.anchors.concat(...anchors);
        this.fee += anchors.length * VAR_FEE;
        return this;
    }

    public addBase64(...anchors: string[]): this {
        this.anchors.concat(...anchors.map(anchor => recode(anchor, Encoding.base64, Encoding.base58)));
        this.fee += anchors.length * VAR_FEE;
        return this;
    }

    private anchorsBinary(): Uint8Array {
        return this.anchors.reduce((current: Uint8Array, anchor: string): Uint8Array => {
            const binary = base58.decode(anchor);
            return concatUint8Arrays(
                current,
                Uint8Array.from(convert.shortToByteArray(binary.length)),
                Uint8Array.from(binary),
            )
        }, new Uint8Array());
    }

    private toBinaryV1(): Uint8Array {
        return concatUint8Arrays(
            Uint8Array.from([this.type, this.version]),
            base58.decode(this.senderPublicKey),
            Uint8Array.from(convert.shortToByteArray(this.anchors.length)),
            this.anchorsBinary(),
            Uint8Array.from(convert.longToByteArray(this.timestamp)),
            Uint8Array.from(convert.longToByteArray(this.fee))
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
            Uint8Array.from(convert.shortToByteArray(this.anchors.length)),
            this.anchorsBinary(),
        );
    }

    public toBinary(): Uint8Array {
        switch (this.version) {
            case 1:  return this.toBinaryV1();
            case 3:  return this.toBinaryV3();
            default: throw Error("Incorrect version");
        }
    }

    public toJson(): ITxJSON {
        return Object.assign(
            {
                id: this.id,
                type: this.type,
                version: this.version,
                sender: this.sender,
                senderKeyType: this.senderKeyType,
                senderPublicKey: this.senderPublicKey,
                fee: this.fee,
                timestamp: this.timestamp,
                proofs: this.proofs,
                height: this.height
            },
            this.sponsorJson()
        );
    }

    public static fromData(data: ITxJSON): Anchor {
        const tx = new Anchor().initFromData(data);
        tx.anchors = data.anchors;

        return tx;
    }
}
