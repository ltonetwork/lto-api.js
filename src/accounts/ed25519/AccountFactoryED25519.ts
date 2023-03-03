import AccountFactory from "../AccountFactory";
import Account from "../Account";
import { IKeyPairBytes } from "../../../interfaces";
import * as nacl from "tweetnacl";
import * as base58 from "../../libs/base58";
import { ED25519 } from "./ED25519";
import ed2curve from "../../libs/ed2curve";
import Binary from "../../Binary";
import {concatBytes, strToBytes} from "../../utils/bytes";
import {generateNewSeed} from "../../utils/mnemonic";
import {buildRawAddress, secureHash} from "../../utils/crypto";
import {sha256} from "../../utils/sha256";

export default class AccountFactoryED25519 extends AccountFactory {
	keyType = "ed25519";
	sign: IKeyPairBytes;
	encrypt: IKeyPairBytes;

	constructor(chainId:string) {
		super(chainId);
	}

	public createFromSeed(seed: string, nonce: number|Uint8Array = 0): Account {
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
		const address = buildRawAddress(sign.publicKey, this.chainId);

		return new Account(cypher, address, sign, encrypt, seed, nonce);
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
		const address = buildRawAddress(sign.publicKey, this.chainId);

		return new Account(cypher, address, sign, encrypt);
	}

	public createFromPublicKey(publicKey: string): Account {
		const keys = {
			privateKey: new Binary(),
			publicKey: Binary.fromBase58(publicKey)
		};

		const sign: IKeyPairBytes = {
			privateKey: keys.privateKey,
			publicKey: keys.publicKey
		};
		const encrypt: IKeyPairBytes = {
			privateKey: new Binary(),
			publicKey: ed2curve.convertSecretKey(keys.publicKey)
		};

		const cypher = new ED25519(sign, encrypt);
		const address = buildRawAddress(sign.publicKey, this.chainId);

		return new Account(cypher, address, sign, encrypt);
	}

	public create(numberOfWords = 15): Account {
		return this.createFromSeed(generateNewSeed(numberOfWords));
	}

	private static buildSignKeyPairFromSeed(seed: string, nonce: number|Uint8Array): IKeyPairBytes {
		if (!seed || typeof seed !== "string")
			throw new Error("Missing or invalid seed phrase");

		const seedBytes = strToBytes(seed);
		const seedHash = AccountFactoryED25519.buildSeedHash(seedBytes, AccountFactory.nonce(nonce));
		const keys = nacl.sign.keyPair.fromSeed(seedHash);

		return {
			privateKey: new Binary(keys.secretKey),
			publicKey: new Binary(keys.publicKey)
		};
	}

	private static buildSeedHash(seedBytes: Uint8Array, nonceBytes: Uint8Array = new Uint8Array()): Uint8Array {
		const seedBytesWithNonce = concatBytes(nonceBytes, seedBytes);
		const seedHash = secureHash(seedBytesWithNonce);

		return sha256(seedHash);
	}

	private static buildSignKeyPairFromPrivateKey(privatekey: string): IKeyPairBytes {
		const keys = nacl.sign.keyPair.fromSecretKey(base58.decode(privatekey));

		return {
			privateKey: new Binary(keys.secretKey),
			publicKey: new Binary(keys.publicKey)
		};
	}
}
