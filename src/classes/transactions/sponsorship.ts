import { Transaction } from '../Transaction';
import { concatUint8Arrays } from '../../utils/concat';
import base58 from '../../libs/base58';
import convert from '../../utils/convert';
import crypto from "../../utils/crypto";

export { Sponsorship }

const TYPE: number = 18;
const DEFAULT_FEE: number = 500000000
const DEFAULT_VERSION: number = 3

class Sponsorship extends Transaction {

    recipient: string;
    txFee: number;
    version: number;
    id: string;
    height: string;
    type: number;

    constructor(recipient: string) {
        super();
        this.recipient = recipient;
        this.type = TYPE
        this.txFee = DEFAULT_FEE
        this.version = DEFAULT_VERSION
    }

    toBinaryV1() {
        return concatUint8Arrays(
            Uint8Array.from([this.type]),
            Uint8Array.from([this.version]),
            Uint8Array.from(crypto.strToBytes(this.chainId)),
            base58.decode(this.senderPublicKey),
            base58.decode(this.recipient),
            Uint8Array.from(convert.longToByteArray(this.timestamp)),
            Uint8Array.from(convert.longToByteArray(this.txFee))
        )
    }
    toBinaryV3() {
        return concatUint8Arrays(
            Uint8Array.from([this.type]),
            Uint8Array.from([this.version]),
            Uint8Array.from(crypto.strToBytes(this.chainId)),
            Uint8Array.from(convert.longToByteArray(this.timestamp)),
            Uint8Array.from([1]),
            base58.decode(this.senderPublicKey),
            Uint8Array.from(convert.longToByteArray(this.txFee)),
            base58.decode(this.recipient)
        )
    }
    toBinary() {
        switch (this.version) {
            case 1:
                return this.toBinaryV1();
            case 3:
                return this.toBinaryV3();
            default:
                console.error("Incorrect version")
        }
    }
    toJson() {
        return (Object.assign({},
            {
                "type": this.type,
                "version": this.version,
                "sender": this.sender,
                "senderKeyType": this.senderKeyType,
                "senderPublicKey": this.senderPublicKey,
                "recipient": this.recipient,
                "timestamp": this.timestamp,
                "fee": this.txFee,
                "proofs": this.proofs
            }, this.sponsorJson()));
    }

    fromData(data) {
        var tx = new Sponsorship(data['recipient']);
        tx.type = data.type;
        'id' in data ? (tx.id = data['id']) : (tx.id = "");
        tx.version = data.version;
        'sender' in data ? (tx.sender = data['sender']) : (tx.sender = '');
        'senderKeyType' in data ? (tx.senderKeyType = data['senderKeyType']) : (tx.senderKeyType = "ed25519");
        tx.senderPublicKey = data['senderPublicKey'];
        data['fee'] ? (tx.txFee = data['fee']) : (tx.txFee = data['txFee']);
        tx.timestamp = data['timestamp'];
        tx.recipient = data.recipient;
        'proofs' in data ? (tx.proofs = data['proofs']) : (tx.proofs = []);
        'height' in data ? (tx.height = data['height']) : (tx.height = '');
        if ('sponsorPublicKey' in data) {
            tx.sponsor = data['sponsor']
            tx.sponsorPublicKey = data['sponsorPublicKey']
        }
        return tx;
    }

}



