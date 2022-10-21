import {IKeyPairBytes, ISignable, ISigner} from "../../interfaces";
import { Encoding, encode } from "../utils/encoder";
import { Cypher } from "./Cypher";
import converters from "../libs/converters";
import Binary from "../Binary";
import {SEED_ENCRYPTION_ROUNDS} from "../constants";
import {encryptSeed} from "../utils/encrypt-seed";
import {getNetwork} from "../utils/crypto";

export default class Account implements ISigner {
	/**
     * LTO Wallet Address
     */
	public readonly address: string;

	/**
     * LTO Network Byte
     */
	public readonly networkByte: string;

	/**
     * Signing keys
     */
	public readonly signKeys: IKeyPairBytes;

	/**
     * Encryption keys
     */
	public readonly encryptKeys: IKeyPairBytes;

	/**
     * Class for sign and verify
     */
	public readonly cypher: Cypher;

	/**
     * Account key type
     */
	public readonly keyType: string;

	/**
     * Seed phrase
     */
	public readonly seed: string;

	/**
     * The nonce is used in combination with the seed to generate the private key
     */
	public readonly nonce: number|Binary;

	/**
	 * Account that will for pay txs this account signs
	 */
	public parent?: Account;

	constructor(
		cypher: Cypher,
		address: string,
		sign: IKeyPairBytes,
		encrypt?: IKeyPairBytes,
		seed?: string,
		nonce: number|Uint8Array = 0
	) {
		this.cypher = cypher;
		this.keyType = cypher.keyType;
		this.address = address;
		this.networkByte = getNetwork(address);
		this.signKeys = sign;
		this.encryptKeys = encrypt;
		this.seed = seed;
		this.nonce = typeof nonce === "number" ? nonce : new Binary(nonce);
	}

	/**
     * Get encrypted seed with a password
     */
	public encryptSeed(password: string): string {
		if (!this.seed) throw new Error("Account seed unknown");
		return encryptSeed(this.seed, password, SEED_ENCRYPTION_ROUNDS);
	}

	/**
     * Get encoded seed
     */
	public encodeSeed(encoding = Encoding.base58): string {
		if (!this.seed) throw new Error("Account seed unknown");
		return encode(Uint8Array.from(converters.stringToByteArray(this.seed)), encoding);
	}

	private signMessage(message: string|Uint8Array): Binary {
		return new Binary(
			this.cypher.createSignature(new Binary(message))
		);
	}

	/**
     * Sign a message
     */
	public sign(message: string|Uint8Array): Binary;
	public sign<T extends ISignable>(subject: T): T;
	public sign(input: string|Uint8Array|ISignable): Binary|ISignable {
		return typeof input === "object" && "signWith" in input
			? input.signWith(this)
			: this.signMessage(input);
	}

	/**
     * Verify a signature with a message
     */
	public verify(message: string|Uint8Array, signature: Uint8Array): boolean {
		return this.cypher.verifySignature(new Binary(message), signature);
	}

	/**
     * Encrypt a message for a particular recipient
     */
	public encryptFor(recipient: Account, message: string|Uint8Array): Binary {
		return new Binary(
			this.cypher.encryptMessage(new Binary(message), recipient.encryptKeys.publicKey)
		);
	}

	/**
     * Decrypt a message from a sender
     */
	public decryptFrom(sender: Account, message: Uint8Array): Binary {
		return new Binary(
			this.cypher.decryptMessage(message, sender.encryptKeys.publicKey)
		);
	}

	/**
     * Base58 encoded public sign key
     */
	public get publicKey(): string {
		return this.signKeys.publicKey.base58;
	}

	/**
     * Base58 encoded private sign key
     */
	public get privateKey(): string {
		return this.signKeys.privateKey.base58;
	}

	/**
	 * Get LTO DID of account
	 */
	public get did(): string {
		return "lto:did:" + this.address;
	}
}
