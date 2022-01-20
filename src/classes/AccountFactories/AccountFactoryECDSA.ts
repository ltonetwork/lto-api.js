import { AccountFactory } from "../AccountFactory";
import { IKeyPairBytes } from "../../../interfaces";
import converters from "../../libs/converters";
import base58 from "../../libs/base58";
import { sha256 } from "js-sha256";
import * as constants from "../../constants";
import encoder from "../../utils/encoder";
import { Account } from "../Account";
import crypto from "../../utils/crypto";


const KJUR = require('jsrsasign');






export { AccountFactoryECDSA }


class AccountFactoryECDSA extends AccountFactory {

	createFromSeed(seed: string, nonce: number = 0): Account {
		throw new Error("Method not implemented.");
	}

	curve: string;
	ec: any;
	compressedPubKey: string;
	sign: IKeyPairBytes;

	constructor(chainId:string, curve = 'secp256k1') {
		super(chainId);
		this.curve = curve
		this.ec = new KJUR.crypto.ECDSA({'curve': this.curve})
    }

    buildSignKeyPairFromSeed(seed: string, nonce: number = 0): IKeyPairBytes {
		
		if (!seed || typeof seed !== "string")
			throw new Error("Missing or invalid seed phrase");

		var keypair = this.ec.generateKeyPairHex();

		let y = this.ec.getPublicKeyXYHex().y;
		let x = this.ec.getPublicKeyXYHex().x;
		this.compressedPubKey = encoder.recode(encoder.add_prefix(x, y),"hex", "base58");

		return {
			privateKey: encoder.decode(keypair.ecprvhex, "hex"),
			publicKey: encoder.decode(keypair.ecpubhex, "hex")
		};
	}

	buildSignKeyPairFromRandom(nonce: number = 0): IKeyPairBytes {
		var keypair = this.ec.generateKeyPairHex();

		let y = this.ec.getPublicKeyXYHex().y;
		let x = this.ec.getPublicKeyXYHex().x;
		this.compressedPubKey = encoder.recode(encoder.add_prefix(x, y),"hex", "base58");

		return {
			privateKey: encoder.decode(keypair.ecprvhex, "hex"),
			publicKey: encoder.decode(keypair.ecpubhex, "hex")
		};
	}
  
    buildSignKeyPairFromPrivateKey(privatekey: string | Uint8Array): IKeyPairBytes {
		if (typeof privatekey !== 'object')
        	var secretKey = base58.decode(privatekey);
		else
			var secretKey = privatekey
		const prvHex = encoder.encode(secretKey, "hex");
		this.ec = new KJUR.crypto.ECDSA({'curve': this.curve, 'prv': prvHex});
		var pubHex = this.ec.generatePublicKeyHex();
		let y = this.ec.getPublicKeyXYHex().y;
		let x = this.ec.getPublicKeyXYHex().x;
		this.compressedPubKey = encoder.recode(encoder.add_prefix(x, y),"hex", "base58");
		return {
			privateKey: secretKey,
			publicKey: encoder.decode(pubHex, "hex")
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

		let mex = sha256(dataBytes);
		let signature = this.ec.signHex(mex, encoder.encode(privateKeyBytes, "hex"));
		return encoder.recode(KJUR.crypto.ECDSA.asn1SigToConcatSig(signature), "hex", "base58");
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

		if (publicKeyBytes.length !== constants.PUBLIC_KEY_LENGTH_ECDSA &&
			publicKeyBytes.length !== constants.UNCOMPRESSED_PUBLIC_KEY_LENGTH_ECDSA) 
			throw new Error("Invalid public key");
		
		if (typeof signature === "string") {
			console.log('here');
			var signatureBytes = encoder.decode(signature, encoding);}
		else 
			signatureBytes = signature;
			
		if (signatureBytes.length != 64) 
			throw new Error("Invalid signature size");
		
		let mex = sha256(dataBytes);
		console.log(encoder.recode(signature, "base58", "hex"));
		return this.ec.verifyHex(mex, KJUR.crypto.ECDSA.concatSigToASN1Sig(encoder.recode(signature, "base58", "hex"))
		, encoder.encode(publicKeyBytes, "hex"));
	}

	createFromPrivateKey(privateKey: string): Account {
		let sign = this.buildSignKeyPairFromPrivateKey(privateKey)
		let address = crypto.buildRawAddress(encoder.decode(this.compressedPubKey, "base58"), this.chainId);
		return new Account(address, sign, null, this.chainId, this.curve);
	}

	create(): Account{
		let sign = this.buildSignKeyPairFromRandom()
		let address = crypto.buildRawAddress(encoder.decode(this.compressedPubKey, "base58"), this.chainId);
		return new Account(address, sign, null, this.chainId, this.curve);
	}


}
