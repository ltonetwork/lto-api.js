// here we test the account signing a transaction

import { LTO } from '../src/LTO';
import * as nacl from 'tweetnacl';


const phrase = 'cool strike recall mother true topic road bright nature dilemma glide shift return mesh strategy';
let account = new LTO('T').createAccountFromExistingPhrase(phrase);

console.log(account.address)

// the transaction 
var type = new String(15);
var version = new String(3);
var chainId = new String('T');
var timestamp = new String(1639735326723);
var senderKeyType = new String('ed25519');
var senderPublicKey = new String('AneNBwCMTG1YQ5ShPErzJZETTsHEWFnPWhdkKiHG6VTX');
var txFee = new String(35000000);
var anchorNumber = new String(1);
var anchorLength = new String(64);
var anchor = new String("0e8210e7117568d4a9f5e00656cfd2d943ba7842a0ef94c41a4831dc5bb39f5f");

var transactionInString;
transactionInString= type.concat(version.toString(), chainId.toString(), timestamp.toString(), senderKeyType.toString(), 
senderPublicKey.toString(), txFee.toString(), anchorNumber.toString(), anchorLength.toString(), anchor.toString());


// convert strin to byte
function strToBytes(str): Array<number> {
  str = unescape(encodeURIComponent(str));
  let bytes = new Array(str.length);
  for (let i = 0; i < str.length; ++i)
      bytes[i] = str.charCodeAt(i);
  return bytes;
}


import { IKeyPairBytes } from '../interfaces';
import base58 from './libs/base58';

let bytes = strToBytes(transactionInString);
console.log(bytes)
const privateKeyBytes = base58.decode(account.getPrivateSignKey())
let sig2 = nacl.sign.detached(Uint8Array.from(bytes), privateKeyBytes);
console.log('signature2', base58.encode(sig2));
let signature = account.signMessage(transactionInString);
console.log('signature1', signature);
//console.log(base58.decode(account.address))

// now broadcasting it

let tx = {
  'type': 15, 
  'version': 3, 
  'sender': '3N5PoiMisnbNPseVXcCa5WDRLLHkj7dz4Du', 
  'senderKeyType': 'ed25519', 
  'senderPublicKey': 'AneNBwCMTG1YQ5ShPErzJZETTsHEWFnPWhdkKiHG6VTX', 
  'fee': 35000000, 
  'timestamp': 1639735326723, 
  'anchors': ['y7wEx68oVL4JcHEJjjQBBWjdV9JQsQw6ApDmCstVRMi5pmu3WvFuhDvSzzgJxy8ejWXbFw7gjeRjkJzp3EXfGLD'], 
  'proofs': ['5JQwEMpry3UFvpKtoyk6AAw8mRqxWdPoG3BJGqUNU1N7fxX1aSCFxzBzfQ6CP5H9cXtuDn38PPtuBw1huvgHqYMC']
}

import convert from './utils/convert';
//let base58Bytes = base58.decode('0e8210e7117568d4a9f5e00656cfd2d943ba7842a0ef94c41a4831dc5bb39f5f');
const length = Uint8Array.from(convert.shortToByteArray(anchor.length));
import { concatUint8Arrays } from './utils/concat';

// the anchor has been converted correctly
console.log('Anchor', base58.encode(Uint8Array.from(strToBytes(anchor))));


// broadcasting the transaction 
const axios = require('axios').default;

/*const url = 'https://testnet.lto.network/'
axios.post(
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

// so now just the signature do not work, we need to do it like the anchor probably
// or change the input data