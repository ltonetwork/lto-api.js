import { AccountFactory } from "../AccountFactory";
import { IKeyPairBytes } from "../../interfaces";
import converters from "../../libs/converters";
import crypto from "../../utils/crypto";
import * as nacl from "tweetnacl";
import base58 from "../../libs/base58";
import { Account } from "../Account";
import { ED25519 } from "./ED25519";
import ed2curve from "../../libs/ed2curve";


export class AccountFactoryED25519 extends AccountFactory {

	keyType:string = 'ed25519';
	sign: IKeyPairBytes;
	encrypt: IKeyPairBytes;

	constructor(chainId:string) {
		super(chainId);
    }

	createFromSeed(seed: string, nonce: number = 0): Account{
		let keys = AccountFactoryED25519.buildSignKeyPairFromSeed(seed, nonce);
		let sign: IKeyPairBytes = {
			privateKey: keys.privateKey,
			publicKey: keys.publicKey
		};

		let encrypt: IKeyPairBytes = {
			privateKey: ed2curve.convertSecretKey(keys.privateKey),
			publicKey: ed2curve.convertSecretKey(keys.publicKey)
		};
		const cypher = new ED25519(sign, encrypt);
		let address = crypto.buildRawAddress(sign.publicKey, this.chainId);
		return new Account(cypher, address, sign, encrypt, seed);
	}

	createFromPrivateKey(privateKey: string): Account {
		let keys = AccountFactoryED25519.buildSignKeyPairFromPrivateKey(privateKey);
		let sign: IKeyPairBytes = {
			privateKey: keys.privateKey,
			publicKey: keys.publicKey
		};
		let encrypt: IKeyPairBytes = {
			privateKey: ed2curve.convertSecretKey(keys.privateKey),
			publicKey: ed2curve.convertSecretKey(keys.publicKey)
		};
		const cypher = new ED25519(sign, encrypt);
		let address = crypto.buildRawAddress(sign.publicKey, this.chainId);
		return new Account(cypher, address, sign, encrypt, null);
	}

	createFromPublicKey(publicKey: string): Account {
		throw Error("Not implemented");
	}

	create(numberOfWords:number = 15): Account {
		return this.createFromSeed(crypto.generateNewSeed(numberOfWords));
	}

	private static buildSignKeyPairFromSeed(seed: string, nonce: number): IKeyPairBytes {
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

	private static buildSignKeyPairFromPrivateKey(privatekey: string): IKeyPairBytes {
		const keys = nacl.sign.keyPair.fromSecretKey(base58.decode(privatekey));
		return {
			privateKey: keys.secretKey,
			publicKey: keys.publicKey
		};
	}
}
