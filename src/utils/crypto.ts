// TODO: This is a collection of random functions. Please organize.

import {IKeyPairBytes} from "../../interfaces";
import * as CryptoJS from "crypto-js";
import {sha256 as sha256hasher} from "js-sha256";
import axlsign from "../libs/axlsign";
import base58 from "../libs/base58";
import * as blake from "../libs/blake2b";
import converters from "../libs/converters";
import secureRandom from "../libs/secure-random";
import {concatUint8Arrays} from "./concat";
import * as constants from "../constants";
import dictionary from "./../seedDictionary";


export function blake2b(input) {
    return blake.blake2b(input, null, 32);
}

function hashChain(input: Uint8Array): Uint8Array {
	return sha256(blake2b(input));
}

function strengthenPassword(password: string, rounds = 5000): string {
	while (rounds--) password = converters.byteArrayToHexString(sha256(password));
	return password;
}

function compareByteArray(array1: Uint8Array | Array<any>, array2: Uint8Array | Array<any>): boolean {
	for (let i = 0; i < array1.length; i++) {
		if (array1[i] !== array2[i])
			return false;

	}
	return true;
}


export function mergeTypedArrays(a, b) {
	// Checks for truthy values on both arrays
	if (!a && !b) throw "Please specify valid arguments for parameters a and b.";

	// Checks for truthy values or empty arrays on each argument
	// to avoid the unnecessary construction of a new array and
	// the type comparison
	if (!b || b.length === 0) return a;
	if (!a || a.length === 0) return b;

	// Make sure that both typed arrays are of the same type
	if (Object.prototype.toString.call(a) !== Object.prototype.toString.call(b))
		throw "The types of the two arguments passed for parameters a and b do not match.";

	const c = new a.constructor(a.length + b.length);
	c.set(a);
	c.set(b, a.length);

	return c;
}

export function buildSeedHash(seedBytes: Uint8Array, nonce = 0): Uint8Array {
	const nonceBytes = new Uint8Array(converters.int32ToBytes(nonce, true));
	const seedBytesWithNonce = concatUint8Arrays(nonceBytes, seedBytes);
	const seedHash = hashChain(seedBytesWithNonce);

	return sha256(seedHash);
}

export function buildEvenChainId(prefix: number, publicKey: string | Uint8Array, randomBytes: Uint8Array): string {
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
}

export function verifyEventId(eventId: string, publicKey?: string): boolean {
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
}

export function buildBoxKeyPair(seed: string): IKeyPairBytes {
	if (!seed || typeof seed !== "string")
		throw new Error("Missing or invalid seed phrase");


	const seedBytes = Uint8Array.from(converters.stringToByteArray(seed));
	const seedHash = this.buildSeedHash(seedBytes);
	const keys = axlsign.generateKeyPair(seedHash, true);

	return {
		privateKey: keys.private,
		publicKey: keys.public
	};
}

export function isValidAddress(address: string, networkByte: number) {

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

}

export function buildRawAddress(publicKeyBytes: Uint8Array, networkByte: string): string {
	if (!publicKeyBytes || (publicKeyBytes.length !== constants.PUBLIC_KEY_LENGTH &&
            publicKeyBytes.length !== constants.PUBLIC_KEY_LENGTH_ECDSA &&
            publicKeyBytes.length !== constants.UNCOMPRESSED_PUBLIC_KEY_LENGTH_ECDSA)
        || !(publicKeyBytes instanceof Uint8Array)
	) {
		throw new Error("Missing or invalid public key");
	}

	const prefix = Uint8Array.from([constants.ADDRESS_VERSION, networkByte.charCodeAt(0)]);
	const publicKeyHashPart = Uint8Array.from(hashChain(publicKeyBytes).slice(0, 20));

	const rawAddress = concatUint8Arrays(prefix, publicKeyHashPart);
	const addressHash = Uint8Array.from(hashChain(rawAddress).slice(0, 4));

	return base58.encode(concatUint8Arrays(rawAddress, addressHash));

}

export function encryptSeed(seed: string, password: string, encryptionRounds?: number): string {

	if (!seed || typeof seed !== "string")
		throw new Error("Seed is required");


	if (!password || typeof password !== "string")
		throw new Error("Password is required");


	password = strengthenPassword(password, encryptionRounds);
	return CryptoJS.AES.encrypt(seed, password).toString();

}

export function decryptSeed(encryptedSeed: string, password: string, encryptionRounds?: number): string {

	if (!encryptedSeed || typeof encryptedSeed !== "string")
		throw new Error("Encrypted seed is required");


	if (!password || typeof password !== "string")
		throw new Error("Password is required");


	password = strengthenPassword(password, encryptionRounds);
	const hexSeed = CryptoJS.AES.decrypt(encryptedSeed, password);
	return converters.hexStringToString(hexSeed.toString());

}

export function sha256(input: Array<number> | Uint8Array | string): Uint8Array {
	return Uint8Array.from(sha256hasher.array(input));
}

export function generateRandomUint8Array(length: number): Uint8Array {
	if (!length || length < 0)
		throw new Error("Missing or invalid array length");


	return secureRandom.randomUint8Array(length);
}

export function generateRandomUint32Array(length: number): Uint32Array {

	if (!length || length < 0)
		throw new Error("Missing or invalid array length");


	const a = secureRandom.randomUint8Array(length);
	const b = secureRandom.randomUint8Array(length);
	const result = new Uint32Array(length);

	for (let i = 0; i < length; i++) {
		const hash = converters.byteArrayToHexString(sha256hasher.array(`${a[i]}${b[i]}`));
		const randomValue = parseInt(hash.slice(0, 13), 16);
		result.set([randomValue], i);
	}

	return result;

}

export function strToBytes(str): Array<number> {
	str = unescape(encodeURIComponent(str));

	const bytes = new Array(str.length);
	for (let i = 0; i < str.length; ++i)
		bytes[i] = str.charCodeAt(i);

	return bytes;
}

export function generateNewSeed(words = 15): string {
	const random = this.generateRandomUint32Array(words);
	const wordCount = dictionary.length;
	const phrase = [];

	for (let i = 0; i < words; i++) {
		const wordIndex = random[i] % wordCount;
		phrase.push(dictionary[wordIndex]);
	}

	return phrase.join(" ");
}

export function randomNonce(): Uint8Array {
	return this.generateRandomUint8Array(24);
}

export function getNetwork(address): string {
	const decodedAddress = base58.decode(address);
	return String.fromCharCode(decodedAddress[1]);
}

export function keyTypeId(keyType) {
	switch (keyType) {
	case "ed25519":
		return 1;
	case "secp256k1":
		return 2;
	case "secp256r1":
		return 3;
	case "rsa":
		return 4;
	default:
		throw Error("Key Type not supported");
	}
}
