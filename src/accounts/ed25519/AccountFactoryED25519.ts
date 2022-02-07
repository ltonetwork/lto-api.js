import { AccountFactory } from "../AccountFactory";
import { IKeyPairBytes } from "../../interfaces";
import converters from "../../libs/converters";
import crypto from "../../utils/crypto";
import * as nacl from "tweetnacl";
import base58 from "../../libs/base58";
import * as constants from "../../constants";
import { Console } from "console";
import { Account } from "../Account";
import encoder from "../../utils/encoder";


export { AccountFactoryED25519 }

class AccountFactoryED25519 extends AccountFactory {

	keyType:string = 'ed25519';
	sign: IKeyPairBytes;

	constructor(chainId:string) {
		super(chainId);
    }

	createFromSeed(seed: string, nonce: number = 0): Account{
		let keys = this.buildSignKeyPairFromSeed(seed, nonce);
		let sign: IKeyPairBytes = {
			privateKey: keys.privateKey,
			publicKey: keys.publicKey
		};
		let address = crypto.buildRawAddress(sign.publicKey, this.chainId);
		return new Account(address, sign, seed, this.chainId, this.keyType);
	}

	createFromPrivateKey(privateKey: string): Account {
		let keys = this.buildSignKeyPairFromPrivateKey(privateKey);
		let sign: IKeyPairBytes = {
			privateKey: keys.privateKey,
			publicKey: keys.publicKey
		};
		let address = crypto.buildRawAddress(sign.publicKey, this.chainId);
		return new Account(address, sign, null, this.chainId, this.keyType);
	}

	create(numberOfWords:number = 15): Account {
		return this.createFromSeed(crypto.generateNewSeed(numberOfWords));
	}


	buildSignKeyPairFromSeed(seed: string, nonce: number): IKeyPairBytes {
		if (!seed || typeof seed !== "string")
			throw new Error("Missing or invalid seed phras e");
		const seedBytes = Uint8Array.from(converters.stringToByteArray(seed));
		const seedHash = crypto.buildSeedHash(seedBytes);
		const keys = nacl.sign.keyPair.fromSeed(seedHash);
		return {
			privateKey: keys.secretKey,
			publicKey: keys.publicKey,
		};
	}

    buildSignKeyPairFromPrivateKey(privatekey: string): IKeyPairBytes {
		const keys = nacl.sign.keyPair.fromSecretKey(base58.decode(privatekey));
		return {
			privateKey: keys.secretKey,
			publicKey: keys.publicKey
		};
	}


    createSignature(input: string | Uint8Array, privateKey: string, encoding = "base58") {

		if (!privateKey || typeof privateKey !== "string") 
			throw new Error("Missing or invalid private key");
		

		let dataBytes: Uint8Array;
		if (typeof input === "string") 
			dataBytes = Uint8Array.from(converters.stringToByteArray(input));
		 else 
			dataBytes = input;
		

		const privateKeyBytes = base58.decode(privateKey);

		if (privateKeyBytes.length !== constants.PRIVATE_KEY_LENGTH) 
			throw new Error("Invalid public key");
		
		return encoder.encode(nacl.sign.detached(dataBytes, privateKeyBytes), "base58");
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

		if (publicKeyBytes.length !== constants.PUBLIC_KEY_LENGTH) 
			throw new Error("Invalid public key");
		

		const signatureBytes = crypto.decode(signature, encoding);

		if (signatureBytes.length != 64) 
			throw new Error("Invalid signature size");
		

		return nacl.sign.detached.verify(dataBytes, signatureBytes, publicKeyBytes);
	}

}
