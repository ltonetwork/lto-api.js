import { type } from "os";
import { Account} from '../Account';
import {Transaction} from '../Transaction';
import { concatUint8Arrays } from '../../utils/concat';
import base58 from '../../libs/base58';
import convert from '../../utils/convert';
import crypto from "../../utils/crypto";

export {RevokeAssociation}

const TYPE: number = 17;
const DEFAULT_FEE: number = 100000000
const DEFAULT_VERSION: number = 3

class RevokeAssociation extends Transaction{

    txFee: number;
    version: number;
    id: string;
    height: string;
    type: number;
    recipient: string;
    associationType: number;
    anchor: string;
    

    constructor(recipient, associationType, anchor='') {
        super();
        this.recipient = recipient
        this.associationType = associationType
        this.anchor = anchor
        this.txFee = DEFAULT_FEE
        this.version = DEFAULT_VERSION
        this.type = TYPE
    }

    toBinaryV1(){
        if (this.anchor){
            return concatUint8Arrays(
                Uint8Array.from([this.type]),
                Uint8Array.from([this.version]), 
                Uint8Array.from(crypto.strToBytes(this.chainId)),
                base58.decode(this.senderPublicKey),
                base58.decode(this.recipient),
                Uint8Array.from(convert.integerToByteArray(this.associationType)),
                Uint8Array.from([1]),
                Uint8Array.from(convert.shortToByteArray(this.anchor.length)),
                Uint8Array.from(convert.stringToByteArray(this.anchor)),
                Uint8Array.from(convert.longToByteArray(this.timestamp)),
                Uint8Array.from(convert.longToByteArray(this.txFee))
            )
        }
        else{
            return concatUint8Arrays(
                Uint8Array.from([this.type]),
                Uint8Array.from([this.version]), 
                Uint8Array.from(crypto.strToBytes(this.chainId)),
                base58.decode(this.senderPublicKey),
                base58.decode(this.recipient),
                Uint8Array.from(convert.integerToByteArray(this.associationType)),
                Uint8Array.from([0]),
                Uint8Array.from(convert.longToByteArray(this.timestamp)),
                Uint8Array.from(convert.longToByteArray(this.txFee))
            )
        }
    }
    toBinaryV3(){
        return concatUint8Arrays(
            Uint8Array.from([this.type]),
            Uint8Array.from([this.version]), 
            Uint8Array.from(crypto.strToBytes(this.chainId)),
            Uint8Array.from(convert.longToByteArray(this.timestamp)),
            Uint8Array.from([1]), 
            base58.decode(this.senderPublicKey),
            Uint8Array.from(convert.longToByteArray(this.txFee)),
            base58.decode(this.recipient),
            Uint8Array.from(convert.integerToByteArray(this.associationType)),
            Uint8Array.from(convert.shortToByteArray(this.anchor.length)),
            Uint8Array.from(convert.stringToByteArray(this.anchor))
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
        return( Object.assign({}, 
            {
                "type": this.type,
                "version": this.version,
                "sender": this.sender,
                "senderKeyType": this.senderKeyType,
                "senderPublicKey": this.senderPublicKey,
                "recipient": this.recipient,
                "associationType": this.associationType,
                "fee": this.txFee,
                "timestamp": this.timestamp,
                "hash": base58.encode(crypto.strToBytes(this.anchor)),
                "proofs": this.proofs
            }, this.sponsorJson()));
    }

    fromData(data){
        var tx = new RevokeAssociation('', '');
        tx.type = data.type;
        tx.version = data['version'];
        'id' in data ? (tx.id = data['id']): (tx.id = "");
        'sender' in data ? (tx.sender = data['sender']) : (tx.sender = '');
        'senderKeyType' in data ? (tx.senderKeyType = data['senderKeyType']) : (tx.senderKeyType = "ed25519");
        tx.senderPublicKey = data['senderPublicKey'];
        tx.recipient = data['recipient']
        tx.associationType = data['associationType']
        'hash' in data ? (tx.anchor = data['hash']) : (tx.anchor = "")
        tx.timestamp = data['timestamp'];
        tx.txFee = data['fee'];
        'proofs' in data ? (tx.proofs = data['proofs']) : (tx.proofs = []);
        'height' in data ? (tx.height = data['height']) : (tx.height = '');

        if ('sponsorPublicKey' in data) {
            tx.sponsor = data['sponsor']
            tx.sponsorPublicKey = data['sponsorPublicKey'] 
        }
        return tx;
    }

}


