// getting the signing key from the account

const axios = require('axios').default;
import * as nacl from 'tweetnacl';
import { Console } from 'console';
import { LTO } from '../src/LTO';
import base58 from './libs/base58';

function strToBytes(str): Array<number> {
  str = unescape(encodeURIComponent(str));

  let bytes = new Array(str.length);
  for (let i = 0; i < str.length; ++i)
      bytes[i] = str.charCodeAt(i);

  return bytes;
}

const phrase = 'cool strike recall mother true topic road bright nature dilemma glide shift return mesh strategy';
let account = new LTO('T').createAccountFromExistingPhrase(phrase);


const privateKeyBytes = base58.decode(account.getPrivateSignKey())

import { concatUint8Arrays } from './utils/concat';
import convert from './utils/convert';
import { isConditionalExpression } from 'typescript';

// so now we want to concatenate the transaction to be signed as a number of Uint8Array
// let's start with getting the anchor, the anchor length

var anchor = new String("0e8210e7117568d4a9f5e00656cfd2d943ba7842a0ef94c41a4831dc5bb39f5f");
// console.log(anchor)

const anchorLength = Uint8Array.from(convert.shortToByteArray(anchor.length));
console.log('first', anchorLength)
var anchorLengthDue = new String(64);
// console.log('last', base58.encode(Uint8Array.from(strToBytes(anchor))));

var type = [15];
var version = [3];
var chainId = new String('T');
var timestamp =  1639735326723;
var senderKeyType = new String('ed25519');
var senderPublicKey = 'AneNBwCMTG1YQ5ShPErzJZETTsHEWFnPWhdkKiHG6VTX';
var txFee = [35000000];

let x = concatUint8Arrays(
      Uint8Array.from(type),
      Uint8Array.from(version),  
      Uint8Array.from(strToBytes(chainId)),
      Uint8Array.from(strToBytes(timestamp)), 
      Uint8Array.from(strToBytes(senderKeyType)), 
      Uint8Array.from(strToBytes(senderPublicKey)),
      Uint8Array.from([0b10000101100000111011000000]),  
      Uint8Array.from([1]), 
      anchorLength, 
      Uint8Array.from(strToBytes(anchor))
);

const signature = nacl.sign.detached(x, privateKeyBytes);
console.log(base58.encode(signature));


let tx = {
  'type': 15, 
  'version': 3, 
  'sender': '3N5PoiMisnbNPseVXcCa5WDRLLHkj7dz4Du', 
  'senderKeyType': 'ed25519', 
  'senderPublicKey': 'AneNBwCMTG1YQ5ShPErzJZETTsHEWFnPWhdkKiHG6VTX', 
  'fee': 35000000, 
  'timestamp': 1639735326723, 
  'anchors': ['y7wEx68oVL4JcHEJjjQBBWjdV9JQsQw6ApDmCstVRMi5pmu3WvFuhDvSzzgJxy8ejWXbFw7gjeRjkJzp3EXfGLD'], 
  'proofs': ['5VygXpb3ubENr3Pt621SgUSyTQbghmCky8U5dH4bqQn5w5jTxPaPyyLYnLguhf4qryorworHozc2pUYQoNSKio1i']
}
const url = 'https://testnet.lto.network/'
/*axios.post(
    'transactions/broadcast', 
    tx, 
    {
    baseURL: url,
    headers: { 'content-type': 'application/json' },
    })
    .then(function (response) {
        // handle success
        console.log(response);
      })
      .catch(function (error) {
        // handle error
        console.log(error);
    });*/
    console.log('fom here')
    console.log(base58.encode(concatUint8Arrays(
      Uint8Array.from(type),
      Uint8Array.from(version), 
      Uint8Array.from(strToBytes(chainId)),
      Uint8Array.from(convert.longToByteArray(timestamp)),
      Uint8Array.from([1]),
      base58.decode(account.getPublicSignKey('base58'))

      
      
      
      )));






var sendKeyType = new String('ed25519');


var encodedPB = account.getPublicSignKey('dsfsdfsd')
var decodedPubKey = base58.decode(account.getPublicSignKey('base58'))

console.log(decodedPubKey)