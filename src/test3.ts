import * as nacl from 'tweetnacl';


let x = nacl.sign.keyPair()
console.log(x.publicKey)
console.log(x.secretKey)

let message = new Uint8Array(1)
message[0] = 0b1

let signedMessage = nacl.sign(message, x.secretKey)
console.log(signedMessage)
console.log(nacl.sign.open(signedMessage, x.publicKey))


function strToBytes(str): Array<number> {
    str = unescape(encodeURIComponent(str));

    let bytes = new Array(str.length);
    for (let i = 0; i < str.length; ++i)
        bytes[i] = str.charCodeAt(i);

    return bytes;
}

let data = {
    'type': 15, 
    'version': 3}
let bytes = strToBytes(data)
console.log('test ', typeof bytes)
const signature = nacl.sign.detached(Uint8Array.from(bytes), x.secretKey)
console.log(signature)
/*
self.TYPE.to_bytes(1, 'big') +
b'\3' +
crypto.str2bytes(self.chain_id) +
struct.pack(">Q", self.timestamp) +
crypto.key_type_id(self.sender_key_type) +
base58.b58decode(self.sender_public_key) +
struct.pack(">Q", self.tx_fee) +
struct.pack(">H", 1) +
struct.pack(">H", len(crypto.str2bytes(self.anchor))) +
crypto.str2bytes(self.anchor)*/
var type = new String(15);
var version = new String(3);
var chainId = new String('T');
var timestamp = new String(1639676582821);
var senderKeyType = new String('ed25519');
var senderPublicKey = new String('AneNBwCMTG1YQ5ShPErzJZETTsHEWFnPWhdkKiHG6VTX');
var txFee = new String(35000000);
var anchorNumber = new String(1);
var anchorLength = new String(64);
var anchor = new String("0e8210e7117568d4a9f5e00656cfd2d943ba7842a0ef94c41a4831dc5bb39f5f");

var transactionInString 
transactionInString= type.concat(version.toString(), chainId.toString(), timestamp.toString(), senderKeyType.toString(), 
senderPublicKey.toString(), txFee.toString(), anchorNumber.toString(), anchorLength.toString(), anchor.toString());
console.log(transactionInString)

let transactionInBytes = strToBytes(transactionInString)
const signatureX = nacl.sign.detached(Uint8Array.from(transactionInBytes), x.secretKey)
// Still need two things: how to append the signature (which format)
// also needs to check that all the data is correct that is in the right encoding etc
console.log(signature)

const axios = require('axios').default;

/*axios.get('https://testnet.lto.network/node/status')
  .then(function (response) {
    // handle success
    console.log(response);
  })
  .catch(function (error) {
    // handle error
    console.log(error);
  });*/

let tx = {
    'type': 15, 
    'version': 3, 
    'sender': '3N5PoiMisnbNPseVXcCa5WDRLLHkj7dz4Du', 
    'senderKeyType': 'ed25519', 
    'senderPublicKey': 'AneNBwCMTG1YQ5ShPErzJZETTsHEWFnPWhdkKiHG6VTX', 
    'fee': 35000000, 
    'timestamp': 1639674564082, 
    'anchors': ['27DjBot2tGXZT7SCuu9fyEu7pNrXbaeXWUeuYB21D6jCENWeEH1G6hV4BR97YXx7ZPaUHELCGeuLAFA3Ruo2gZkH'], 
    'proofs': ['5PjCXwpevrCRcuJPfMy1dEyqciqdAbwKdWScENBcnytGgiYGz8ssRbYdZBgk5kYsJzJJzeBRQAXvGwrkuBHMvNzd']
}
console.log(typeof tx)
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
