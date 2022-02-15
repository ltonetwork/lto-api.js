import Transaction from "./Transaction";
import {concatUint8Arrays} from "../utils/concat";
import base58 from "../libs/base58";
import convert from "../utils/convert";
import crypto from "../utils/crypto";
import {Encoding, ITxJSON} from "../interfaces";

const TYPE = 17;
const DEFAULT_FEE = 100000000;
const DEFAULT_VERSION = 3;

export default class RevokeAssociation extends Transaction {
    public recipient: string;
    public associationType: number;
    public hash?: string;

    constructor(recipient: string, associationType: number, hash?: string, encoding = Encoding.base58) {
        super(TYPE, DEFAULT_VERSION, DEFAULT_FEE);

        this.recipient = recipient;
        this.associationType = associationType;
        this.hash = hash;
    }

    private toBinaryV1(): Uint8Array {
        const hashBinary = this.hash ? base58.decode(this.hash) : null;
        const hashBytes = hashBinary
            ? concatUint8Arrays(
                Uint8Array.from([1]),
                Uint8Array.from(convert.shortToByteArray(hashBinary.length)),
                Uint8Array.from(hashBinary),
            )
            : Uint8Array.from([0]);

        return concatUint8Arrays(
            Uint8Array.from([this.type, this.version]),
            Uint8Array.from(crypto.strToBytes(this.chainId)),
            base58.decode(this.senderPublicKey),
            base58.decode(this.recipient),
            Uint8Array.from(convert.integerToByteArray(this.associationType)),
            hashBytes,
            Uint8Array.from(convert.longToByteArray(this.timestamp)),
            Uint8Array.from(convert.longToByteArray(this.fee))
        );
    }

    private toBinaryV3(): Uint8Array {
        const hashBinary = this.hash ? base58.decode(this.hash) : new Uint8Array();

        return concatUint8Arrays(
            Uint8Array.from([this.type, this.version]),
            Uint8Array.from(crypto.strToBytes(this.chainId)),
            Uint8Array.from(convert.longToByteArray(this.timestamp)),
            Uint8Array.from([crypto.keyTypeId(this.senderKeyType)]),
            base58.decode(this.senderPublicKey),
            Uint8Array.from(convert.longToByteArray(this.fee)),
            base58.decode(this.recipient),
            Uint8Array.from(convert.integerToByteArray(this.associationType)),
            Uint8Array.from(convert.shortToByteArray(hashBinary.length)),
            Uint8Array.from(hashBinary)
        );
    }

    public toBinary(): Uint8Array {
        switch (this.version) {
            case 1:  return this.toBinaryV1();
            case 3:  return this.toBinaryV3();
            default: throw new Error("Incorrect version");
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
                recipient: this.recipient,
                associationType: this.associationType,
                fee: this.fee,
                timestamp: this.timestamp,
                hash: this.hash,
                proofs: this.proofs,
                height: this.height,
            },
            this.sponsorJson()
        );
    }

    public static fromData(data: ITxJSON): RevokeAssociation {
        return new RevokeAssociation(data.recipient, data.associationType, data.hash).initFromData(data);
    }
}
