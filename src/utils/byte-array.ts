import secureRandom from "../libs/secure-random";
import converters from "../libs/converters";
import {sha256 as sha256hasher} from "js-sha256";

export function concatByteArray(...args: Uint8Array[]): Uint8Array {
	if (args.length < 2)
		throw new Error("Two or more Uint8Array are expected");

	if (!(args.every((arg) => arg instanceof Uint8Array)))
		throw new Error("One of arguments is not a Uint8Array");

	const count = args.length;
	const sumLength = args.reduce((sum, arr) => sum + arr.length, 0);

	const result = new Uint8Array(sumLength);

	let curLength = 0;

	for (let i = 0; i < count; i++) {
		result.set(args[i], curLength);
		curLength += args[i].length;
	}

	return result;
}

export function compareByteArray(array1: Uint8Array | Array<any>, array2: Uint8Array | Array<any>): boolean {
	return array1.every((c, i) => c === array2[i]);
}

export function strToBytes(str): Uint8Array {
	str = unescape(encodeURIComponent(str));

	const bytes = new Uint8Array(str.length);
	for (let i = 0; i < str.length; ++i)
		bytes[i] = str.charCodeAt(i);

	return bytes;
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
