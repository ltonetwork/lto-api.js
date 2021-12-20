import { type } from "os";
import { Account} from '../Account';
import {Transaction} from '../Transaction';
import { concatUint8Arrays } from '../../utils/concat';
import base58 from '../../libs/base58';
import convert from '../../utils/convert';
import crypto from "../../utils/crypto";

export {Anchor}

class Anchor extends Transaction{

    TYPE:number = 15;
    DEFAULT_FEE:number = 35000000
    DEFAULT_VERSION: number = 3

    anchor: string;
    tx_fee: number;
    version: number;

    constructor(anchor: string) {
        super();
        this.anchor = anchor;
        this.tx_fee = this.DEFAULT_FEE;
        this.version = this.DEFAULT_VERSION;
 
    }


    toBinary(){
        return concatUint8Arrays(
            Uint8Array.from([this.TYPE]),
            Uint8Array.from([this.DEFAULT_VERSION]), 
            Uint8Array.from(crypto.strToBytes(this.chainId)),
            Uint8Array.from(convert.longToByteArray(this.timestamp)),
            Uint8Array.from([1]), 
            base58.decode(this.senderPublicKey),
            Uint8Array.from(convert.longToByteArray(this.tx_fee)),
            Uint8Array.from(convert.shortToByteArray(1)),
            Uint8Array.from(convert.shortToByteArray(this.anchor.length)),
            Uint8Array.from(convert.stringToByteArray(this.anchor))
            )
    }

    toJson() {
        return(
            {
                "type": this.TYPE,
                "version": this.version,
                "sender": this.sender,
                "senderKeyType": this.senderKeyType,
                "senderPublicKey": this.senderPublicKey,
                "fee": this.tx_fee,
                "timestamp": this.timestamp,
                "anchors": [base58.encode(crypto.strToBytes(this.anchor))],
                "proofs": this.proofs
            })
    }

}



