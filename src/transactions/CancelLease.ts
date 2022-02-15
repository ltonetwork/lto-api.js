import Transaction from "./Transaction";
import {concatUint8Arrays} from "../utils/concat";
import base58 from "../libs/base58";
import convert from "../utils/convert";
import crypto from "../utils/crypto";
import {ITxJSON} from "../interfaces";

const TYPE = 9;
const DEFAULT_FEE = 100000000;
const DEFAULT_VERSION = 3;

export default class CancelLease extends Transaction {
    public leaseId: string;

    constructor(leaseId: string) {
        super(TYPE, DEFAULT_VERSION, DEFAULT_FEE);
        this.leaseId = leaseId;
    }

    private toBinaryV2(): Uint8Array {
        return concatUint8Arrays(
            Uint8Array.from([this.type, this.version]),
            Uint8Array.from(crypto.strToBytes(this.chainId)),
            base58.decode(this.senderPublicKey),
            Uint8Array.from(convert.longToByteArray(this.fee)),
            Uint8Array.from(convert.longToByteArray(this.timestamp)),
            Uint8Array.from(base58.decode(this.leaseId))
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
            Uint8Array.from(base58.decode(this.leaseId))
        );
    }

    public toBinary(): Uint8Array {
        switch (this.version) {
            case 2:  return this.toBinaryV2();
            case 3:  return this.toBinaryV3();
            default: throw Error("Incorrect version");
        }
    }

    toJson(): ITxJSON {
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
                leaseId: this.leaseId,
                height: this.height
            },
            this.sponsorJson()
        );
    }

    static fromData(data: ITxJSON): CancelLease {
        return new CancelLease(data.leaseId).initFromData(data);
    }
}
