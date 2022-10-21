import {AES} from "crypto-js";
import converters from "../libs/converters";
import {sha256} from "./sha256";

function strengthenPassword(password: string, rounds = 5000): string {
	while (rounds--) password = converters.byteArrayToHexString(sha256(password));
	return password;
}

export function encryptSeed(seed: string, password: string, encryptionRounds?: number): string {
	if (!seed || typeof seed !== "string")
		throw new Error("Seed is required");

	if (!password || typeof password !== "string")
		throw new Error("Password is required");

	password = strengthenPassword(password, encryptionRounds);

	return AES.encrypt(seed, password).toString();
}

export function decryptSeed(encryptedSeed: string, password: string, encryptionRounds?: number): string {
	if (!encryptedSeed || typeof encryptedSeed !== "string")
		throw new Error("Encrypted seed is required");

	if (!password || typeof password !== "string")
		throw new Error("Password is required");

	password = strengthenPassword(password, encryptionRounds);
	const hexSeed = AES.decrypt(encryptedSeed, password);

	return converters.hexStringToString(hexSeed.toString());
}
