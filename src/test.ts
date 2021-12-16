import {Account} from '../src/classes/Account';
import {LTO} from '../src/LTO';


//let account = new LTO('T').createAccount();
let account = new Account('seed phrase', 'T');
console.log(account.address);
console.log(account.sign);
console.log(account.seed);


const { randomBytes } = require('crypto')
const secp256k1 = require('secp256k1')
import { sha256 } from 'js-sha256';

// or require('secp256k1/elliptic')
//   if you want to use pure js implementation in node
 
// generate message to sign
// message should have 32-byte length, if you have some other length you can hash message
// for example `msg = sha256(rawMessage)`

//const msg = randomBytes(32)
let rawMessage = 'hello'
const msg = sha256(rawMessage)
console.log(msg.length)
// generate privKey
let privKey
do {
  privKey = randomBytes(32)
} while (!secp256k1.privateKeyVerify(privKey))
 
// get the public key in a compressed format
const pubKey = secp256k1.publicKeyCreate(privKey)
 
// sign the message
const sigObj = secp256k1.ecdsaSign(msg, privKey)
 
// verify the signature
console.log(secp256k1.ecdsaVerify(sigObj.signature, msg, pubKey))
// => true