import base58 from "../libs/base58";
import secureRandom from "../libs/secure-random";
import {compareByteArray, concatByteArray} from "./byte-array";
import * as constants from "../constants";
import {sha256} from "./sha256";
import {blake2b} from "./blake2b";

export function secureHash(input: Array<number> | Uint8Array | string): Uint8Array {
	return sha256(blake2b(input));
}

export function isValidAddress(address: string, networkByte: number) {
	if (!address || typeof address !== "string")
		throw new Error("Missing or invalid address");

	const addressBytes = base58.decode(address);

	if (addressBytes[0] !== 1 || addressBytes[1] !== networkByte)
		return false;

	const key = addressBytes.slice(0, 22);
	const check = addressBytes.slice(22, 26);
	const keyHash = secureHash(key).slice(0, 4);

	return compareByteArray(keyHash, check);
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
	const publicKeyHashPart = Uint8Array.from(secureHash(publicKeyBytes).slice(0, 20));

	const rawAddress = concatByteArray(prefix, publicKeyHashPart);
	const addressHash = Uint8Array.from(secureHash(rawAddress).slice(0, 4));

	return base58.encode(concatByteArray(rawAddress, addressHash));
}

export function randomNonce(): Uint8Array {
	return secureRandom.randomUint8Array(24);
}

export function getNetwork(address): string {
	const decodedAddress = base58.decode(address);
	return String.fromCharCode(decodedAddress[1]);
}

export function keyTypeId(keyType) {
	const types = {
		ed25519: 1,
		secp256k1: 2,
		secp256r1: 3,
		rsa: 4
	};

	if (!(keyType in types)) throw Error("Key Type not supported");

	return types[keyType];
}
