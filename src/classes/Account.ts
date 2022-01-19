import {IKeyPair, IKeyPairBytes, TBuffer} from "../../interfaces";
import { EventChain } from "./EventChain";
import { Event } from "./Event";
import { HTTPSignature } from "./HTTPSignature";

import convert from "../utils/convert";
import crypto from "../utils/crypto";
import ed2curve from "../libs/ed2curve";
import encoder from "../utils/encoder";
import { AccountFactoryED25519 } from "./AccountFactories/AccountFactoryED25519"
import { AccountFactoryECDSA } from "./AccountFactories/AccountFactoryECDSA"

export class Account {

	/**
   * LTO Wallet Address
   */
	public address: string;

	/**
   * LTO Network Byte
   */
	public networkByte: string;

	/**
   * Seed
   */
	public seed: string;

	/**
   * Signing keys
   */
	public sign: IKeyPairBytes;

	/**
   * Encryption keys
   */
	public encrypt: IKeyPairBytes;

	/**
   * Key type
   */
	public keyType: string;

	/**
   * Key type
   */
	public nonce: number;


	/**
   * Account Factories
   */
	public accountFactories: any;

	constructor(address:string, sign: IKeyPairBytes, seed?: string, networkByte = "L", keyType = "ed25519", nonce: number = 0) {
		this.networkByte = networkByte;
		this.keyType = keyType;
		this.nonce = nonce;
		this.address = address;
		this.sign = sign;
		this.seed = seed;

		this.accountFactories = {
			'ed25519': new AccountFactoryED25519(this.networkByte),
			'secp256r1': new AccountFactoryECDSA(this.networkByte, 'secp256r1'),
			'secp256k1': new AccountFactoryECDSA(this.networkByte, 'secp256k1')
		}
	}

	/**
   * Create an event chain
   */
	public createEventChain(nonce?: string): EventChain {

		const eventChain = new EventChain();
		eventChain.init(this, nonce);

		return eventChain;
	}

	/**
   * Encrypt the seed with a password
   */
	public encryptSeed(password: string, encryptionRounds = 5000): string {

		return crypto.encryptSeed(this.seed, password, encryptionRounds);
	}

	/**
   * Get encoded seed 
   */
	public getEncodedSeed(): string {
		return encoder.encode(Uint8Array.from(convert.stringToByteArray(this.seed)));
	}

	/**
   * Add a signature to the event
   */
	public signEvent(event: Event): Event {

		event.signkey = this.getPublicVerifyKey();

		const message = event.getMessage();
		event.signature = this.Sign(message);
		event.hash = event.getHash();
		return event;
	}

	/**
   * Add a signature to the http request
   */
	public signHTTPSignature(httpSign: HTTPSignature, algorithm = "ed25519-sha256", encoding = "base64") {
		const message = httpSign.getMessage();

		let requestBytes: Uint8Array = Uint8Array.from(convert.stringToByteArray(message));
		switch(algorithm) {
		case "ed25519":
			break;

		case "ed25519-sha256":
			requestBytes = crypto.sha256(requestBytes);
			break;

		default:
			throw new Error(`Unsupported algorithm: ${algorithm}`);
		}

		return this.accountFactories[this.keyType].createSignature(requestBytes, this.getPrivateSignKey(), encoding);
	}

	/**
   * Verify a signature with a message
   */
	public Verify(signature: string, message: string | Uint8Array, encoding = "base58"): boolean {

		let requestBytes: Uint8Array;

		if (typeof message === "string") 
			requestBytes = Uint8Array.from(convert.stringToByteArray(message));
		 else 
			requestBytes = message;
		

		return this.accountFactories[this.keyType].verifySignature(requestBytes, signature, this.getPublicVerifyKey(), encoding);
	}

	/**
   * Create a signature from a message
   */
	public Sign(message: string | TBuffer, encoding = "base58") {
		return this.accountFactories[this.keyType].createSignature(message, this.getPrivateSignKey());
	}

	/**
   * Encrypts a message for a particular recipient
   */
	public encryptFor(recipient: Account, message: string): Uint8Array {
		return crypto.encryptMessage(message, recipient.getPublicEncryptKey(), this.getPrivateEncryptKey(), this.getNonce());
	}

	/**
   * Decrypts a message from a sender
   */
	public decryptFrom(sender: Account, message: Uint8Array): string {
		return crypto.decryptMessage(message, sender.getPrivateEncryptKey(), this.getPublicEncryptKey());
	}

	public getSignKeys(encoding = "base58"): IKeyPair {
		return {
			privateKey: this.getPrivateSignKey(encoding),
			publicKey: this.getPublicVerifyKey(encoding)
		};
	}

	public getEncryptKeys(encoding = "base58"): IKeyPair {
		return {
			privateKey: this.getPrivateEncryptKey(encoding),
			publicKey: this.getPublicEncryptKey(encoding)
		};
	}

	/**
   * Get public sign key in the given encoding
   */
	public getPublicVerifyKey(encoding = "base58"): string {
		return encoder.encode(this.sign.publicKey, encoding);
	}


	/**
   * Get private sign key in the given encoding
   */
	public getPrivateSignKey(encoding = "base58"): string {
		return encoder.encode(this.sign.privateKey, encoding);
	}

	/**
   * Get public encrypt key in the given encoding
   */
	public getPublicEncryptKey(encoding = "base58"): string {
		return encoder.encode(this.encrypt.publicKey, encoding);
	}

	/**
   * Get public encrypt key in the given encoding
   */
	public getPrivateEncryptKey(encoding = "base58"): string {
		return encoder.encode(this.encrypt.privateKey, encoding);
	}

	/**
   * Generate a random 24 byte nonce
   */
	public getNonce(): Uint8Array {
		return crypto.generateRandomUint8Array(24);
	}
}