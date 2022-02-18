import { AccountFactory } from "../AccountFactory";
import { IKeyPairBytes } from "../../../interfaces";
import converters from "../../libs/converters";
import * as crypto from "../../utils/crypto";
import * as nacl from "tweetnacl";
import base58 from "../../libs/base58";
import Account from "../Account";
import { ED25519 } from "./ED25519";
import ed2curve from "../../libs/ed2curve";
import Binary from "../../Binary";


export class AccountFactoryED25519 extends AccountFactory {
	keyType = 'ed25519';
	sign: IKeyPairBytes;
	encrypt: IKeyPairBytes;

	constructor(chainId:string) {
		super(chainId);
    }

	public createFromSeed(seed: string, nonce = 0): Account {
		const keys = AccountFactoryED25519.buildSignKeyPairFromSeed(seed, nonce);
		const sign: IKeyPairBytes = {
			privateKey: keys.privateKey,
			publicKey: keys.publicKey
		};
		const encrypt: IKeyPairBytes = {
			privateKey: ed2curve.convertSecretKey(keys.privateKey),
			publicKey: ed2curve.convertSecretKey(keys.publicKey)
		};

		const cypher = new ED25519(sign, encrypt);
		const address = crypto.buildRawAddress(sign.publicKey, this.chainId);

		return new Account(cypher, address, sign, encrypt, seed);
	}

	public createFromPrivateKey(privateKey: string): Account {
		const keys = AccountFactoryED25519.buildSignKeyPairFromPrivateKey(privateKey);
		const sign: IKeyPairBytes = {
			privateKey: keys.privateKey,
			publicKey: keys.publicKey
		};
		const encrypt: IKeyPairBytes = {
			privateKey: ed2curve.convertSecretKey(keys.privateKey),
			publicKey: ed2curve.convertSecretKey(keys.publicKey)
		};
		const cypher = new ED25519(sign, encrypt);
		const address = crypto.buildRawAddress(sign.publicKey, this.chainId);

		return new Account(cypher, address, sign, encrypt);
	}

	public createFromPublicKey(publicKey: string): Account {
		throw Error("Not implemented");
	}

	public create(numberOfWords = 15): Account {
		return this.createFromSeed(crypto.generateNewSeed(numberOfWords));
	}

	private static buildSignKeyPairFromSeed(seed: string, nonce: number): IKeyPairBytes {
		if (!seed || typeof seed !== "string")
			throw new Error("Missing or invalid seed phrase");

		const seedBytes = Uint8Array.from(converters.stringToByteArray(seed));
		const seedHash = crypto.buildSeedHash(seedBytes, nonce);
		const keys = nacl.sign.keyPair.fromSeed(seedHash);

		return {
			privateKey: new Binary(keys.secretKey),
			publicKey: new Binary(keys.publicKey)
		};
	}

	private static buildSignKeyPairFromPrivateKey(privatekey: string): IKeyPairBytes {
		const keys = nacl.sign.keyPair.fromSecretKey(base58.decode(privatekey));

		return {
			privateKey: new Binary(keys.secretKey),
			publicKey: new Binary(keys.publicKey)
		};
	}
}
