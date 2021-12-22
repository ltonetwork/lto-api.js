import {Transaction} from '../Transaction';
import { concatUint8Arrays } from '../../utils/concat';
import base58 from '../../libs/base58';
import convert from '../../utils/convert';
import crypto from "../../utils/crypto";
import { resolve } from 'path/posix';

export {Transfer}

const TYPE: number = 4;
const DEFAULT_FEE: number = 100000000
const DEFAULT_VERSION: number = 3

class Transfer extends Transaction{

    recipient: string;
    amount:number;
    txFee: number;
    version: number;
    id: string;
    height: string;
    type: number;
    attachment: string;

    constructor(recipient: string, amount: number, attachment: string = '') {
        super();
        this.recipient = recipient;
        this.amount = amount;
        this.attachment = attachment;
        this.type = TYPE
        this.txFee = DEFAULT_FEE
        this.version = DEFAULT_VERSION
    }

    toBinaryV1(){
        return concatUint8Arrays(
            Uint8Array.from([this.type]),
            Uint8Array.from([this.version]), 
            base58.decode(this.senderPublicKey),
            Uint8Array.from(convert.longToByteArray(this.timestamp)),
            Uint8Array.from(convert.longToByteArray(this.amount)),
            Uint8Array.from(convert.longToByteArray(this.txFee)),
            base58.decode(this.recipient),
            Uint8Array.from(convert.shortToByteArray(this.attachment.length)),
            Uint8Array.from(convert.stringToByteArray(this.attachment))
            )
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
            Uint8Array.from(convert.longToByteArray(this.amount)),
            Uint8Array.from(convert.shortToByteArray(this.attachment.length)),
            Uint8Array.from(convert.stringToByteArray(this.attachment))
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
                "fee": this.txFee,
                "timestamp": this.timestamp,
                "amount": this.amount,
                "recipient": this.recipient,
                "attachment": base58.encode(crypto.strToBytes(this.attachment)),
                "proofs": this.proofs
            }, this.sponsorJson()));
    }

    fromData(data){
        var tx = new Transfer(data['recipient'], data['amount']);
        tx.type = data.type;
        'id' in data ? (tx.id = data['id']): (tx.id = "");
        tx.version = data.version;
        'sender' in data ? (tx.sender = data['sender']) : (tx.sender = '');
        'senderKeyType' in data ? (tx.senderKeyType = data['senderKeyType']) : (tx.senderKeyType = "ed25519");
        tx.senderPublicKey = data['senderPublicKey'];
        tx.txFee = data['fee'];
        tx.timestamp = data['timestamp'];
        tx.amount = data.amount;
        tx.recipient = data.recipient;
        'attachment' in data ? (tx.attachment = data['attachment']) : (tx.attachment = '');
        'proofs' in data ? (tx.proofs = data['proofs']) : (tx.proofs = []);
        'height' in data ? (tx.height = data['height']) : (tx.height = '');
        if ('sponsorPublicKey' in data) {
            tx.sponsor = data['sponsor']
            tx.sponsorPublicKey = data['sponsorPublicKey'] 
        }
        return tx;
    }

}



