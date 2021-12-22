import {Transaction} from '../Transaction';
import { concatUint8Arrays } from '../../utils/concat';
import base58 from '../../libs/base58';
import convert from '../../utils/convert';
import crypto from "../../utils/crypto";
import { resolve } from 'path/posix';
import { LanguageVariant } from 'typescript';

export {CancelLease}

const TYPE: number = 9;
const DEFAULT_FEE: number = 500000000
const DEFAULT_VERSION: number = 3

class CancelLease extends Transaction{

    leaseId: string;
    txFee: number;
    version: number;
    id: string;
    height: string;
    type: number;

    constructor(leaseId: string) {
        super();
        this.leaseId = leaseId
        this.type = TYPE
        this.txFee = DEFAULT_FEE
        this.version = DEFAULT_VERSION
    }

    toBinaryV2(){
        return concatUint8Arrays(
            Uint8Array.from([this.type]),
            Uint8Array.from([this.version]), 
            Uint8Array.from(crypto.strToBytes(this.chainId)),
            base58.decode(this.senderPublicKey),
            Uint8Array.from(convert.longToByteArray(this.txFee)),
            Uint8Array.from(convert.longToByteArray(this.timestamp)),
            Uint8Array.from(base58.decode(this.leaseId))
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
            Uint8Array.from(base58.decode(this.leaseId))
            )
    }
    toBinary() {
        switch (this.version) {
            case 2:
                return this.toBinaryV2();
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
                "proofs": this.proofs,
                "leaseId": this.leaseId
            }, this.sponsorJson()));
    }

    fromData(data){
        var tx = new CancelLease('');
        tx.type = data.type;
        'id' in data ? (tx.id = data['id']): (tx.id = "");
        tx.version = data.version;
        'sender' in data ? (tx.sender = data['sender']) : (tx.sender = '');
        'senderKeyType' in data ? (tx.senderKeyType = data['senderKeyType']) : (tx.senderKeyType = "ed25519");
        tx.senderPublicKey = data['senderPublicKey'];
        tx.txFee = data['fee'];
        tx.timestamp = data['timestamp'];
        'proofs' in data ? (tx.proofs = data['proofs']) : (tx.proofs = []);
        'height' in data ? (tx.height = data['height']) : (tx.height = '');
        'leaseId' in data ? (tx.leaseId = data['leaseId']) : (tx.leaseId = '');
        if ('sponsorPublicKey' in data) {
            tx.sponsor = data['sponsor']
            tx.sponsorPublicKey = data['sponsorPublicKey'] 
        }
        return tx;
    }

}



