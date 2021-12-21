import { type } from "os";
import { Account} from '../Account';
import {Transaction} from '../Transaction';
import { concatUint8Arrays } from '../../utils/concat';
import base58 from '../../libs/base58';
import convert from '../../utils/convert';
import crypto from "../../utils/crypto";

export {Anchor}

class Anchor extends Transaction{

    anchor: string;
    txFee: number = 35000000;
    version: number = 3;
    type: number = 15;

    constructor(anchor: string) {
        super();
        this.anchor = anchor;
    }


    toBinary(){
        return concatUint8Arrays(
            Uint8Array.from([this.type]),
            Uint8Array.from([this.version]), 
            Uint8Array.from(crypto.strToBytes(this.chainId)),
            Uint8Array.from(convert.longToByteArray(this.timestamp)),
            Uint8Array.from([1]), 
            base58.decode(this.senderPublicKey),
            Uint8Array.from(convert.longToByteArray(this.txFee)),
            Uint8Array.from(convert.shortToByteArray(1)),
            Uint8Array.from(convert.shortToByteArray(this.anchor.length)),
            Uint8Array.from(convert.stringToByteArray(this.anchor))
            )
    }

    toJson() {
        return(
            {
                "type": this.type,
                "version": this.version,
                "sender": this.sender,
                "senderKeyType": this.senderKeyType,
                "senderPublicKey": this.senderPublicKey,
                "fee": this.txFee,
                "timestamp": this.timestamp,
                "anchors": [base58.encode(crypto.strToBytes(this.anchor))],
                "proofs": this.proofs
            })
    }

    fromData(data){
        var tx = new Anchor('');
        tx.type = data.type;
        return 'hello';
    }

}



