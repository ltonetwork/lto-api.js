import { Anchor } from './classes/transactions/anchor'
import { LTO } from './LTO';
import { PublicNode } from './classes/publicNode';
import { getPositionOfLineAndCharacter, moveSyntheticComments } from 'typescript';
import { type } from 'os';
import { typeOf } from 'ts-utils';
import { __awaiter } from 'tslib';
import base58 from './libs/base58';
import { Transfer } from './classes/transactions/transfer';
import crypto from "./utils/crypto";
import convert from './utils/convert';
import { data } from '@lto-network/lto-transactions';


const phrase = 'cool strike recall mother true topic road bright nature dilemma glide shift return mesh strategy';
const phrase2 = 'cage afford gym kitchen price physical grid impulse tumble uncover deliver bounce dance display vintage';
let account = new LTO('T').createAccountFromExistingPhrase(phrase);
let third = new LTO('T').createAccountFromExistingPhrase(phrase2);

let node = new PublicNode('https://testnet.lto.network');

let transaction = new Transfer(third.address, 100000000);
transaction.timestamp = 1640103898090
transaction.signWith(account);
console.log(transaction.proofs)

//transaction.sponsorWith(account);
async function my(){
    let ret = await transaction.broadcastTo(node);
    //console.log(ret)
}
my();



/*
let data = {
    {"type":4,
    "version":3,
    "sender":"3N5PoiMisnbNPseVXcCa5WDRLLHkj7dz4Du",
    "senderKeyType":"ed25519",
    "senderPublicKey":"AneNBwCMTG1YQ5ShPErzJZETTsHEWFnPWhdkKiHG6VTX",
    "fee":100000000,
    "timestamp":1640103898090,
    "amount":100000000,
    "recipient":"3NACnKFVN2DeFYjspHKfa2kvDqnPkhjGCD2",
    "attachment":"",
    "proofs":["2eBSC4B3bULMCWLzQpL5SsEwfCwFoyNe6ggSNFufJVTNdzmUkADt5ZXWHbW7ECqzj3tkV3Bke6MKVFPGGbGsrJa5"]
}
*/
//console.log(third.address);
//console.log(account.address);
//let decoded = base58.decode(third.address)
//console.log(base58.encode(decoded));
let attachment = 'fkwjfskjfhsekfljwlekjwelkrjwlrekj'
console.log(base58.encode(Uint8Array.from(convert.shortToByteArray(attachment.length))))

//amouunt checked
let version = 1
let expires = 3453454


let data2 = {"expires": (version != 1 ? (expires) : (""))}

console.log(data2)