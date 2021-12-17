import { type } from "os";
import { Account} from '../src/classes/Account';

class Anchor{

    TYPE:number = 15
    DEFAULT_FEE:number = 35000000
    DEFAULT_VERSION: number = 3
    anchor: string;
    tx_fee: number;
    version: number;

    constructor(anchor: string) {
        this.anchor = anchor;
        this.tx_fee = this.DEFAULT_FEE;
        this.version = this.DEFAULT_VERSION;
    }


    toBinary(){
        console.log(this.anchor)
    }

}

let transaction = new Anchor('fdefeferferferfe')
transaction.toBinary()

//console.log(x.toString(16))
//let x = bx01
//console.log(typeof x.toString(16))

function print(t){
    console.log(t);
}
var uint8 = new Uint8Array(1);
uint8[0] = 0b10;
print(uint8)

var buffer2 = new ArrayBuffer(3);
buffer2[0] = 0b1
var z = new Uint8Array(buffer2, 1, 2);
z[0] = 0b10
print(typeof z)
print(z)




const buf = Buffer.from('test', 'utf8');

console.log(buf.toString('base64'));


console.log(Buffer.from('fhqwhgads', 'utf8'));
// Prints: <Buffer 66 68 71 77 68 67 61 64 73>






var typeX = 15;
var versionX = 3;
var sender = '3N5PoiMisnbNPseVXcCa5WDRLLHkj7dz4Du';
var senderKeyType = 'ed25519';
var senderPublicKey = 'AneNBwCMTG1YQ5ShPErzJZETTsHEWFnPWhdkKiHG6VTX';
var txFee = 35000000;
var timestamp = 1639666625147;
var proofs = ['UHrc59nFvZXeQ2bEsQrLaDmQJGm4TmytgSvARtjm7xqM1iY9jpQZQhzCkZ5nAS1pFpowC9cXcDmwJ1ey3CFJXNe'];

var account = new Account();
console.log(account.address)


