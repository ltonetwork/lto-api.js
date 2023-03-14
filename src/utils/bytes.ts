import {randomUint8Array} from "../libs/secure-random";
import {sha256 as sha256hasher} from "js-sha256";

export function hexToBytes(hex: string): Uint8Array {
	const bytes = [];
	for (let c = 0; c < hex.length; c += 2)
		bytes.push(parseInt(hex.substr(c, 2), 16));
	return new Uint8Array(bytes);
}

/** Convert a byte array to a hex string */
export function bytesToHex(bytes: Uint8Array|ArrayLike<number>): string {
	const hex: string[] = [];
	for (let i = 0; i < bytes.length; i++) {
		const current = bytes[i] < 0 ? bytes[i] + 256 : bytes[i];
		hex.push((current >>> 4).toString(16));
		hex.push((current & 0xF).toString(16));
	}
	return hex.join("");
}

export function concatBytes(...args: Uint8Array[]): Uint8Array {
	if (!(args.every((arg) => arg instanceof Uint8Array)))
		throw new Error("One of arguments is not a Uint8Array");

	const sumLength = args.reduce((sum, arr) => sum + arr.length, 0);
	const result = new Uint8Array(sumLength);

	let curLength = 0;

	for (const arg of args) {
		result.set(arg, curLength);
		curLength += arg.length;
	}

	return result;
}

export function compareBytes(array1: Uint8Array | Array<any>, array2: Uint8Array | Array<any>): boolean {
	return array1.every((c, i) => c === array2[i]);
}

export function strToBytes(str: string): Uint8Array {
	str = unescape(encodeURIComponent(str));
	return new TextEncoder().encode(str);
}

export function mergeTypedArrays<T extends ArrayLike<any>>(a: T, b: T): T {
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

	const c = new (a as any).constructor(a.length + b.length);
	c.set(a);
	c.set(b, a.length);

	return c;
}

export function generateRandomUint32Array(length: number): Uint32Array {
	if (!length || length < 0)
		throw new Error("Missing or invalid array length");

	const a = randomUint8Array(length);
	const b = randomUint8Array(length);
	const result = new Uint32Array(length);

	for (let i = 0; i < length; i++) {
		const hash = bytesToHex(sha256hasher.array(`${a[i]}${b[i]}`));
		const randomValue = parseInt(hash.slice(0, 13), 16);
		result.set([randomValue], i);
	}

	return result;
}

// Duplicate of lib/converters.ts

/**
 * Produces an array of the specified number of bytes to represent the integer
 * value. Default output encodes ints in little endian format. Handles signed
 * as well as unsigned integers. Due to limitations in JavaScript's number
 * format, x cannot be a true 64 bit integer (8 bytes).
 */
function intToBytes(x: number, numBytes: number, unsignedMax: number, opt_bigEndian: boolean) {
	const signedMax = Math.floor(unsignedMax / 2);
	const negativeMax = (signedMax + 1) * -1;
	if (x != Math.floor(x) || x < negativeMax || x > unsignedMax) {
		throw new Error(
			x + " is not a " + (numBytes * 8) + " bit integer");
	}
	const bytes = [];
	let current;
	// Number type 0 is in the positive int range, 1 is larger than signed int,
	// and 2 is negative int.
	const numberType = x >= 0 && x <= signedMax ? 0 :
		x > signedMax && x <= unsignedMax ? 1 : 2;
	if (numberType == 2) {
		x = (x * -1) - 1;
	}
	for (let i = 0; i < numBytes; i++) {
		if (numberType == 2) {
			current = 255 - (x % 256);
		} else {
			current = x % 256;
		}

		if (opt_bigEndian) {
			bytes.unshift(current);
		} else {
			bytes.push(current);
		}

		if (numberType == 1) {
			x = Math.floor(x / 256);
		} else {
			x = x >> 8;
		}
	}
	return Uint8Array.from(bytes);
}

export function int32ToBytes(x: number, opt_bigEndian: boolean): Uint8Array {
	return intToBytes(x, 4, 4294967295, opt_bigEndian);
}

export function int16ToBytes(x: number, opt_bigEndian: boolean): Uint8Array {
	return intToBytes(x, 2, 65535, opt_bigEndian);
}
