import { Account } from "./LTO";
import encoder from './utils/encoder'
import { AccountFactoryECDSA } from "./classes/AccountFactories/AccountFactoryECDSA"
import converters from "./libs/converters";
import { sha256 } from "js-sha256";
const KJUR = require('jsrsasign');


let account = new Account('seded', 'T', 'secp256k1');
console.log("random priv: ", encoder.encode(account.sign.privateKey, "hex"))
console.log("random pub: ", encoder.encode(account.sign.publicKey, "hex"))

let factory = new AccountFactoryECDSA('T', 'secp256k1');
//let pk = encoder.decode('116c6a9953e600d6e6d9a07d73e46706cab164e3fd4dfc7600b6b396de4528fb', "hex");

//let acc2 = factory.buildSignKeyPairFromSecret(encoder.encode(pk, "base58"));

// 

let message = 'hello';
console.log(account.getPrivateSignKey())
console.log(account.getPublicSignKey())
let signature = factory.createSignature(message, account.getPrivateSignKey());
console.log("signature", signature);


let dataBytes = Uint8Array.from(converters.stringToByteArray(message));
let mex = sha256(dataBytes);
let ec = new KJUR.crypto.ECDSA({'curve': 'secp256k1'});
const publicKeyBytes = encoder.decode(account.getPublicSignKey(), "base58");

console.log(ec.verifyHex(mex, KJUR.crypto.ECDSA.concatSigToASN1Sig(signature), encoder.encode(publicKeyBytes, "hex")));

console.log(factory.verifySignature(message, encoder.recode(signature, "hex", "base58"), account.getPublicSignKey()));
