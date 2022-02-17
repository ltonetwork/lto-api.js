import Transaction from "./Transaction";
import {concatUint8Arrays} from "../utils/concat";
import base58 from "../libs/base58";
import * as convert from "../utils/convert";
import * as crypto from "../utils/crypto";
import {ITxJSON} from "../../interfaces";
import Binary from "../Binary";

const BASE_FEE = 25000000;
const VAR_FEE = 10000000;
const DEFAULT_VERSION = 3;

export default class Anchor extends Transaction {
    public static readonly TYPE = 15;

    public anchors: Binary[];

    constructor(...anchors: Uint8Array[]) {
        super(Anchor.TYPE, DEFAULT_VERSION, BASE_FEE + (anchors.length * VAR_FEE));
        this.anchors = anchors.map(anchor => new Binary(anchor));
    }

    /** Get binary for anchors as used by toBinary methods */
    private anchorsBinary(): Uint8Array {
        return this.anchors.reduce(
            (current: Uint8Array, binary: Uint8Array): Uint8Array => concatUint8Arrays(
                current,
                Uint8Array.from(convert.shortToByteArray(binary.length)),
                Uint8Array.from(binary),
            ),
            new Uint8Array()
        );
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
        const anchors = (data.anchors ?? []).map(Binary.fromBase58);
        return new Anchor(...anchors).initFromData(data);
    }
}

