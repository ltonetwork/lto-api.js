// @ts-nocheck
declare let require: any;

function nodeRandom(count): Uint8Array {
	const crypto = require(/* webpackIgnore: true */ "crypto");
	return new Uint8Array(crypto.randomBytes(count).buffer);
}

function browserRandom(count): Uint8Array {
	const nativeArr = new Uint8Array(count);
	const crypto = self.crypto || self.msCrypto;
	crypto.getRandomValues(nativeArr);
	return nativeArr;
}

export function randomUint8Array(count: number): Uint8Array {
	return typeof window !== "undefined" || typeof self !== "undefined"
		? browserRandom(count)
		: nodeRandom(count);
}
