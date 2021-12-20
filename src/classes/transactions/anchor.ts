import { type } from "os";
import { Account} from '../Account';
import {Transaction} from '../Transaction';

class Anchor extends Transaction{

    TYPE:number = 15
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
        console.log(this.anchor)
    }

}

let transaction = new Anchor('fdefeferferferfe')
console.log(transaction.isSigned())





