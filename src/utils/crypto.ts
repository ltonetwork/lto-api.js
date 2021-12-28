import { IKeyPairBytes } from "../../interfaces";

import * as CryptoJS from "crypto-js";

import { sha256 } from "js-sha256";

import axlsign from "../libs/axlsign";
import base58 from "../libs/base58";
import base64 from "../libs/base64";
import * as blake from "../libs/blake2b";
import converters from "../libs/converters";
import secureRandom from "../libs/secure-random";
import { keccak256 } from "../libs/sha3";
import * as nacl from "tweetnacl";

import { concatUint8Arrays } from "./concat";

import * as constants from "../constants";

function SHA256(input: Array<number> | Uint8Array | string): Uint8Array {

	return Uint8Array.from(sha256.digest(input));
}

function blake2b(input) {
	return blake.blake2b(input, null, 32);
}

function keccak(input) {
	return (keccak256 as any).array(input);
}

function hashChain(input: Uint8Array): Uint8Array {
	return SHA256(blake2b(input));
}

function buildSeedHash(seedBytes: Uint8Array): Uint8Array {
	const nonce = new Uint8Array(converters.int32ToBytes(constants.INITIAL_NONCE, true));
	const seedBytesWithNonce = concatUint8Arrays(nonce, seedBytes);
	const seedHash = hashChain(seedBytesWithNonce);
	return SHA256(seedHash);
}

function strengthenPassword(password: string, rounds = 5000): string {
	while (rounds--) password = converters.byteArrayToHexString(SHA256(password));
	return password;
}

function compareByteArray(array1: Uint8Array | Array<any>, array2: Uint8Array | Array<any>) : boolean {
	for (let i = 0; i < array1.length; i++) {
		if (array1[i] !== array2[i]) 
			return false;
		
	}
	return true;
}

function encode(input: Uint8Array, encoding = "base58"): string {
	switch (encoding) {
	case "base64":
		return base64.encode(input);
	default:
		return base58.encode(input);
	}
}

function decode(input: string, encoding = "base58"): Uint8Array {
	switch (encoding) {
	case "base64":
		return base64.decode(input);

	default:
		return base58.decode(input);
	}
}

function mergeTypedArrays(a, b) {
	// Checks for truthy values on both arrays
	if(!a && !b) throw "Please specify valid arguments for parameters a and b.";

	// Checks for truthy values or empty arrays on each argument
	// to avoid the unnecessary construction of a new array and
	// the type comparison
	if(!b || b.length === 0) return a;
	if(!a || a.length === 0) return b;

	// Make sure that both typed arrays are of the same type
	if(Object.prototype.toString.call(a) !== Object.prototype.toString.call(b))
		throw "The types of the two arguments passed for parameters a and b do not match.";

	const c = new a.constructor(a.length + b.length);
	c.set(a);
	c.set(b, a.length);

	return c;
}


export default {

	createSignature(input: string | Uint8Array, privateKey: string, encoding = "base58"): string {

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
		

		const signature = nacl.sign.detached(dataBytes, privateKeyBytes);
		return encode(signature, encoding);
	},

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
		

		const signatureBytes = decode(signature, encoding);

		if (signatureBytes.length != 64) 
			throw new Error("Invalid signature size");
		

		return nacl.sign.detached.verify(dataBytes, signatureBytes, publicKeyBytes);
	},

	encryptMessage(message: string | Uint8Array, theirPublicKey: string, myPrivateKey: string, nonce: Uint8Array): Uint8Array {
		if (!myPrivateKey || typeof myPrivateKey !== "string") 
			throw new Error("Missing or invalid private key");
		

		if (!theirPublicKey || typeof theirPublicKey !== "string") 
			throw new Error("Missing or invalid public key");
		

		let dataBytes: Uint8Array;
		if (typeof message == "string") 
			dataBytes = Uint8Array.from(converters.stringToByteArray(message));
		 else 
			dataBytes = message;
		

		const privateKeyBytes = base58.decode(myPrivateKey);
		const publicKeyBytes = base58.decode(theirPublicKey);

		return mergeTypedArrays(nacl.box(dataBytes, nonce, publicKeyBytes, privateKeyBytes), nonce);
	},

	decryptMessage(cypher: Uint8Array, privateKey: string, publicKey: string): string {
		const message = cypher.slice(0, -24);
		const nonce = cypher.slice(-24);

		const privateKeyBytes = base58.decode(privateKey);
		const publicKeyBytes = base58.decode(publicKey);

		return String.fromCharCode.apply(null, nacl.box.open(message, nonce, publicKeyBytes, privateKeyBytes));
	},

	buildEvenChainId(prefix: number, publicKey: string | Uint8Array, randomBytes: Uint8Array): string {

		if (!publicKey) 
			throw new Error("Missing or invalid public key");
		

		let publicKeyBytes: Uint8Array;
		if (typeof publicKey == "string") 
			publicKeyBytes = Uint8Array.from(converters.stringToByteArray(publicKey));
		 else 
			publicKeyBytes = publicKey;
		

		const prefixBytes = Uint8Array.from([prefix]);

		const publicKeyHashPart = Uint8Array.from(hashChain(publicKeyBytes).slice(0, 20));
		const rawId = concatUint8Arrays(prefixBytes, randomBytes, publicKeyHashPart);
		const addressHash = Uint8Array.from(hashChain(rawId).slice(0, 4));

		return base58.encode(concatUint8Arrays(rawId, addressHash));
	},

	verifyEventId(eventId: string, publicKey?: string): boolean {
		const idBytes = base58.decode(eventId);

		if (idBytes[0] != constants.EVENT_CHAIN_VERSION) 
			return false;
		

		const id = idBytes.slice(0, 41);
		const check = idBytes.slice(41, 45);
		const keyHash = hashChain(id).slice(0, 4);

		let res = compareByteArray(check, keyHash);

		if (publicKey) {
			const keyBytes = idBytes.slice(9, 29);
			const publicKeyBytes = Uint8Array.from(hashChain(base58.decode(publicKey)).slice(0, 20));
			res = res && compareByteArray(keyBytes, publicKeyBytes);
		}

		return res;
	},

	buildHash(eventBytes: Array<number> | Uint8Array | string, encoding = "base58"): string {
		return encode(SHA256(eventBytes), encoding);
	},

	buildBoxKeyPair(seed: string): IKeyPairBytes {
		if (!seed || typeof seed !== "string") 
			throw new Error("Missing or invalid seed phrase");
		

		const seedBytes = Uint8Array.from(converters.stringToByteArray(seed));
		const seedHash = buildSeedHash(seedBytes);
		const keys = axlsign.generateKeyPair(seedHash, true);

		return {
			privateKey: keys.private,
			publicKey: keys.public
		};
	},

	buildNaclSignKeyPair(seed: string): IKeyPairBytes {
		if (!seed || typeof seed !== "string") 
			throw new Error("Missing or invalid seed phrase");
		

		const seedBytes = Uint8Array.from(converters.stringToByteArray(seed));
		const seedHash = buildSeedHash(seedBytes);
		const keys = nacl.sign.keyPair.fromSeed(seedHash);
		return {
			privateKey: keys.secretKey,
			publicKey: keys.publicKey
		};
	},

	buildNaclSignKeyPairFromSecret(privatekey: string): IKeyPairBytes {

		const keys = nacl.sign.keyPair.fromSecretKey(base58.decode(privatekey));
		return {
			privateKey: keys.secretKey,
			publicKey: keys.publicKey
		};
	},

	isValidAddress(address: string, networkByte: number) {

		if (!address || typeof address !== "string") 
			throw new Error("Missing or invalid address");
		

		const addressBytes = base58.decode(address);

		if (addressBytes[0] !== 1 || addressBytes[1] !== networkByte) 
			return false;
		

		const key = addressBytes.slice(0, 22);
		const check = addressBytes.slice(22, 26);
		const keyHash = hashChain(key).slice(0, 4);

		for (let i = 0; i < 4; i++) {
			if (check[i] !== keyHash[i]) 
				return false;
			
		}

		return true;

	},

	buildRawAddress(publicKeyBytes: Uint8Array, networkByte: string): string {

		if (!publicKeyBytes || publicKeyBytes.length !== constants.PUBLIC_KEY_LENGTH || !(publicKeyBytes instanceof Uint8Array)) 
			throw new Error("Missing or invalid public key");
		

		const prefix = Uint8Array.from([constants.ADDRESS_VERSION, networkByte.charCodeAt(0)]);
		const publicKeyHashPart = Uint8Array.from(hashChain(publicKeyBytes).slice(0, 20));

		const rawAddress = concatUint8Arrays(prefix, publicKeyHashPart);
		const addressHash = Uint8Array.from(hashChain(rawAddress).slice(0, 4));

		return base58.encode(concatUint8Arrays(rawAddress, addressHash));

	},

	encryptSeed(seed: string, password: string, encryptionRounds?: number): string {

		if (!seed || typeof seed !== "string") 
			throw new Error("Seed is required");
		

		if (!password || typeof password !== "string") 
			throw new Error("Password is required");
		

		password = strengthenPassword(password, encryptionRounds);
		return CryptoJS.AES.encrypt(seed, password).toString();

	},

	decryptSeed(encryptedSeed: string, password: string, encryptionRounds?: number): string {

		if (!encryptedSeed || typeof encryptedSeed !== "string") 
			throw new Error("Encrypted seed is required");
		

		if (!password || typeof password !== "string") 
			throw new Error("Password is required");
		

		password = strengthenPassword(password, encryptionRounds);
		const hexSeed = CryptoJS.AES.decrypt(encryptedSeed, password);
		return converters.hexStringToString(hexSeed.toString());

	},

	sha256(input: Array<number> | Uint8Array | string): Uint8Array {
		return Uint8Array.from(sha256.array(input));
	},

	generateRandomUint8Array(length: number): Uint8Array {
		if (!length || length < 0) 
			throw new Error("Missing or invalid array length");
		

		return secureRandom.randomUint8Array(length);
	},

	generateRandomUint32Array(length: number): Uint32Array {

		if (!length || length < 0) 
			throw new Error("Missing or invalid array length");
		

		const a = secureRandom.randomUint8Array(length);
		const b = secureRandom.randomUint8Array(length);
		const result = new Uint32Array(length);

		for (let i = 0; i < length; i++) {
			const hash = converters.byteArrayToHexString(sha256.array(`${a[i]}${b[i]}`));
			const randomValue = parseInt(hash.slice(0, 13), 16);
			result.set([randomValue], i);
		}

		return result;

	},
	strToBytes(str): Array<number> {
		str = unescape(encodeURIComponent(str));
    
		const bytes = new Array(str.length);
		for (let i = 0; i < str.length; ++i)
			bytes[i] = str.charCodeAt(i);
    
		return bytes;
	}

};