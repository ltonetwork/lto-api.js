import { AccountFactory } from "../AccountFactory";
import { IKeyPairBytes } from "../../../interfaces";
import converters from "../../libs/converters";
import base58 from "../../libs/base58";
import crypto from "../../utils/crypto";
import { sha256 } from "js-sha256";
const secp256k1 = require('secp256k1')
import * as constants from "../../constants";
import { data } from "@lto-network/lto-transactions";

// import { Account } from "../../LTO"
// import encoder from "../../utils/encoder";
//import dictionary from "../../seedDictionary";
// const { generateMnemonic } = require("ethereum-cryptography/bip39");
const { mnemonicToSeedSync } = require("ethereum-cryptography/bip39");
const { HDKey } = require("ethereum-cryptography/hdkey");
// const { createPrivateKeySync, ecdsaSign, ecdsaVerify } = require("ethereum-cryptography/secp256k1");







export { AccountFactoryECDSA }

var bip32DerivationPath = "m/44'/60'/0'/0"


class AccountFactoryECDSA extends AccountFactory {

	constructor(chainId:string) {
		super(chainId);
    }

    buildSignKeyPair(seed: string, nonce: number = 0): IKeyPairBytes {
		if (!seed || typeof seed !== "string")
			throw new Error("Missing or invalid seed phrase");

		let bip39Seed = mnemonicToSeedSync(seed);
		let derivationPath = bip32DerivationPath + "/" + nonce;
		const hdkey = HDKey.fromMasterSeed(bip39Seed);
		const childKey = hdkey.derive(derivationPath);
		

		return {
			privateKey: new Uint8Array(childKey.privateKey),
			publicKey: new Uint8Array(childKey.publicKey)
		};
	}
  
    buildSignKeyPairFromSecret(privatekey: string): IKeyPairBytes {
        const secretKey = base58.decode(privatekey)
		const publicKey = secp256k1.publicKeyCreate(secretKey);
		return {
			privateKey: secretKey,
			publicKey: publicKey
		};
	}

	createSignature(input: string | Uint8Array, privateKey: string, encoding = "base58"): string {

		if (!privateKey || typeof privateKey !== "string") 
			throw new Error("Missing or invalid private key");
		

		let dataBytes: Uint8Array;
		if (typeof input === "string") 
			dataBytes = Uint8Array.from(converters.stringToByteArray(input));
		 else 
			dataBytes = input;
		

		const privateKeyBytes = base58.decode(privateKey);

		if (privateKeyBytes.length !== constants.PRIVATE_KEY_LENGTH_ECDSA) 
			throw new Error("Invalid public key");

		let mex = Buffer.from(sha256(dataBytes), 'hex')
		const signature = secp256k1.ecdsaSign(mex, privateKeyBytes)
		return signature.signature;
	}

	verifySignature(input: string | Uint8Array, signature: string | Uint8Array, publicKey: string, encoding = "base58"): boolean {
		if (!publicKey || typeof publicKey !== "string") 
			throw new Error("Missing or invalid public key");
		

		let dataBytes: Uint8Array;
		if (typeof input === "string") 
			dataBytes = Uint8Array.from(converters.stringToByteArray(input));
		 else 
			dataBytes = input;

		const publicKeyBytes = base58.decode(publicKey);

		if (publicKeyBytes.length !== constants.PUBLIC_KEY_LENGTH_ECDSA) 
			throw new Error("Invalid public key");
		
		if (typeof signature === "string") 
			var signatureBytes = crypto.decode(signature, encoding);
		else 
			signatureBytes = signature;
			
		if (signatureBytes.length != 64) 
			throw new Error("Invalid signature size");
		let mex = Buffer.from(sha256(dataBytes), 'hex')
		return secp256k1.ecdsaVerify(signatureBytes, mex, publicKeyBytes);
	}


}
