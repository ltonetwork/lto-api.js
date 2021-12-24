import { Anchor } from './classes/transactions/anchor'
import { LTO } from './LTO';
import { PublicNode } from './classes/publicNode';
import { getPositionOfLineAndCharacter, moveSyntheticComments } from 'typescript';
import { concatUint8Arrays } from './utils/concat';
import { type } from 'os';
import { typeOf } from 'ts-utils';
import { __awaiter } from 'tslib';
import base58 from './libs/base58';
import { Transfer } from './classes/transactions/transfer';
import crypto from "./utils/crypto";
import convert from './utils/convert';
import { data } from '@lto-network/lto-transactions';
import { Association } from './classes/transactions/association';
import { RevokeAssociation } from './classes/transactions/revokeAssociation';
import { CancelLease } from './classes/transactions/cancelLease';
import { Lease } from './classes/transactions/lease';
import { Sponsorship } from './classes/transactions/sponsorship';
import { CancelSponsorship } from './classes/transactions/CancelSponsorship';
import { Recipient } from './byteProcessor/ByteProcessor';
import { MassTransfer } from './classes/transactions/massTransfer';


const phrase = 'cool strike recall mother true topic road bright nature dilemma glide shift return mesh strategy';
const phrase2 = 'cage afford gym kitchen price physical grid impulse tumble uncover deliver bounce dance display vintage';
let account = new LTO('T').createAccountFromExistingPhrase(phrase);
let third = new LTO('T').createAccountFromExistingPhrase(phrase2);

let node = new PublicNode('https://testnet.lto.network');

//let transaction = new Transfer(third.address, 100000000);

let transfers = [
    {"recipient": '3NACnKFVN2DeFYjspHKfa2kvDqnPkhjGCD2', "amount": 100000000},
    {"recipient": '3NACnKFVN2DeFYjspHKfa2kvDqnPkhjGCD2', "amount": 200000000},
];



//console.log(base58.encode(Uint8Array.from([0])))



/*console.log(base58.encode(Uint8Array.from([transaction.type])))
console.log(base58.encode(Uint8Array.from([transaction.version])))
console.log(base58.encode(Uint8Array.from(crypto.strToBytes(transaction.chainId))))
console.log(base58.encode(Uint8Array.from(convert.longToByteArray(transaction.timestamp))))
console.log(base58.encode(Uint8Array.from([1])))
console.log(base58.encode(base58.decode(transaction.senderPublicKey)))
console.log(base58.encode(Uint8Array.from(convert.longToByteArray(transaction.txFee))))
console.log(base58.encode(base58.decode(transaction.recipient)))
console.log(base58.encode(Uint8Array.from(convert.integerToByteArray(transaction.associationType))))
console.log(base58.encode(Uint8Array.from(convert.longToByteArray(transaction.expires))))
console.log(base58.encode(Uint8Array.from(convert.shortToByteArray(transaction.anchor.length))))
console.log(base58.encode(Uint8Array.from(convert.stringToByteArray(transaction.anchor))))*/

//let ciccio = 'esfesf'

//ciccio ? (console.log("inside")) : (console.log('outside'))

//let leaseId = '7n6qcJFARzSbhD3Qdk1ESDYvAYBVwxtifuUT8xL8ftDn'
//console.log(base58.encode(Uint8Array.from(base58.decode(leaseId))))




var recipient = '3NACnKFVN2DeFYjspHKfa2kvDqnPkhjGCD2';
var amount: number = 100000000;
var attachment: string = 'What a nice Transfer'


let transaction = new Transfer(recipient, amount, attachment);

console.log(Date.now())
//transaction.timestamp = 1640338882999;
transaction.signWith(account);
//console.log(transaction.proofs)
//console.log(transaction.toJson())
//transaction.sponsorWith(account);
async function my(){
    let ret = await transaction.broadcastTo(node);
    console.log(ret)
}
//my();



let boh = {
    txFee: 100000000,
    timestamp: 1640338882999,
    proofs: [
      '5mR25hKkydocTbVk6Fq7dbN8fvRt7fHNhZKPPoREcxtMMiR3xZWAaSGDGSWFGWXN3PSRxjzAwg5rz1LUDD5r1o5Q'
    ],
    sender: '3N5PoiMisnbNPseVXcCa5WDRLLHkj7dz4Du',
    senderPublicKey: 'AneNBwCMTG1YQ5ShPErzJZETTsHEWFnPWhdkKiHG6VTX',
    chainId: '',
    sponsor: '',
    sponsorPublicKey: '',
    senderKeyType: 'ed25519',
    sponsorKeyType: 'ed25519',
    recipient: '3NACnKFVN2DeFYjspHKfa2kvDqnPkhjGCD2',
    amount: 100000000,
    attachment: '2DdU3NvpXxaG7ZgtjjM3nREs9ZgV',
    type: 4,
    version: 3,
    id: 'Fp5qtxgTbG5bvsJWHYqF78VQTjF5qXezBSnvCg84it3b',
    height: ''
  }

let actual = transaction.fromData(boh)
console.log(actual.txFee)
console.log(boh.txFee)

