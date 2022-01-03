import { AccountFactory } from "../AccountFactory";
import { IKeyPairBytes } from "../../../interfaces";
import converters from "../../libs/converters";
import base58 from "../../libs/base58";
import crypto from "../../utils/crypto";
import { sha256 } from "js-sha256";
const secp256k1 = require('secp256k1')
import * as constants from "../../constants";




export { AccountFactoryECDSA }

class AccountFactoryECDSA extends AccountFactory {

	constructor(chainId:string) {
		super(chainId);
    }

    buildSignKeyPair(seed: string): IKeyPairBytes {
		if (!seed || typeof seed !== "string")
			throw new Error("Missing or invalid seed phrase");
		const secretKey = Buffer.from(sha256(seed), 'hex');
        const publicKey = secp256k1.publicKeyCreate(secretKey)
		return {
			privateKey: new Uint8Array(secretKey),
			publicKey: publicKey,
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
		

		const signature = secp256k1.ecdsaSign(dataBytes, privateKeyBytes)
		return signature.signature;
	}

	verifySignature(input: string | Uint8Array, signature: string, publicKey: string, encoding = "base58"): boolean {
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
		

		const signatureBytes = crypto.decode(signature, encoding);

		if (signatureBytes.length != 64) 
			throw new Error("Invalid signature size");
		

		return secp256k1.ecdsaVerify(dataBytes, signatureBytes, publicKeyBytes);
	}


}
