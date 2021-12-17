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
import { binary } from '@lto-network/lto-transactions/dist/parseSerialize';
import { sign } from 'secp256r1';

// so now we want to concatenate the transaction to be signed as a number of Uint8Array
// let's start with getting the anchor, the anchor length

var anchor = "7b08bcf7db118ebf9247d4665b7896929339394ff60f05886bdb17dc0fb4e7dc";
var type = [15];
var version = [3];
var chainId = new String('T');
var timestamp =  1639762065696;
var senderKeyType = new String('ed25519');
var senderPublicKey = 'AneNBwCMTG1YQ5ShPErzJZETTsHEWFnPWhdkKiHG6VTX';
var txFee = [35000000];



let tx = {
  'type': 15, 
  'version': 3, 
  'sender': '3N5PoiMisnbNPseVXcCa5WDRLLHkj7dz4Du', 
  'senderKeyType': 'ed25519', 
  'senderPublicKey': 'AneNBwCMTG1YQ5ShPErzJZETTsHEWFnPWhdkKiHG6VTX', 
  'fee': 35000000, 
  'timestamp': 1639762065696, 
  'anchors': ['27DwT2ER34qA8mreoswvLvFteeiJieWgJkEZehY4nDcjjdXTiC8gfX5aBFYpET1bqCZ3zgHj4KxLCSPYzqQHzDbx'], 
  'proofs': ['4PsVCrWYUgtvHXDzi6P26xTQbevFzqJHmxqM1Emg3dpdDiJi4g1FRaqH499DTSMtezv32ypn41te5PtGTSL1PyjL']
}
const url = 'https://testnet.lto.network/'
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
    });

var binaryTx = concatUint8Arrays(
  Uint8Array.from(type),
  Uint8Array.from(version), 
  Uint8Array.from(strToBytes(chainId)),
  Uint8Array.from(convert.longToByteArray(timestamp)),
  Uint8Array.from([1]),
  base58.decode(account.getPublicSignKey('base58')),
  Uint8Array.from(convert.longToByteArray(35000000)),
  Uint8Array.from(convert.shortToByteArray(1)),
  Uint8Array.from(convert.shortToByteArray(anchor.length)),
  Uint8Array.from(convert.stringToByteArray(anchor))
  )
  const sig = nacl.sign.detached(binaryTx, privateKeyBytes);
  console.log(base58.encode(sig))