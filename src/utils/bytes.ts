import { randomUint8Array } from '../libs/secure-random';
import { sha256 as sha256hasher } from 'js-sha256';

export function hexToBytes(hex: string): Uint8Array {
  const bytes = [];
  for (let c = 0; c < hex.length; c += 2) bytes.push(parseInt(hex.substr(c, 2), 16));
  return new Uint8Array(bytes);
}

/** Convert a byte array to a hex string */
export function bytesToHex(bytes: Uint8Array | ArrayLike<number>): string {
  const hex: string[] = [];
  for (let i = 0; i < bytes.length; i++) {
    const current = bytes[i] < 0 ? bytes[i] + 256 : bytes[i];
    hex.push((current >>> 4).toString(16));
    hex.push((current & 0xf).toString(16));
  }
  return hex.join('');
}

export function concatBytes(...args: Uint8Array[]): Uint8Array {
  if (!args.every((arg) => arg instanceof Uint8Array)) throw new Error('One of arguments is not a Uint8Array');

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
  if (!a && !b) throw 'Please specify valid arguments for parameters a and b.';

  // Checks for truthy values or empty arrays on each argument
  // to avoid the unnecessary construction of a new array and
  // the type comparison
  if (!b || b.length === 0) return a;
  if (!a || a.length === 0) return b;

  // Make sure that both typed arrays are of the same type
  if (Object.prototype.toString.call(a) !== Object.prototype.toString.call(b))
    throw 'The types of the two arguments passed for parameters a and b do not match.';

  const c = new (a as any).constructor(a.length + b.length);
  c.set(a);
  c.set(b, a.length);

  return c;
}

export function generateRandomUint32Array(length: number): Uint32Array {
  if (!length || length < 0) throw new Error('Missing or invalid array length');

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

// Uses big endian
export function int32ToBytes(value: number): Uint8Array {
  const bytes = new Uint8Array(4);
  bytes[3] = value & 0xff;
  bytes[2] = (value >> 8) & 0xff;
  bytes[1] = (value >> 16) & 0xff;
  bytes[0] = (value >> 24) & 0xff;
  return bytes;
}

// Uses big endian
export function int16ToBytes(value: number): Uint8Array {
  const bytes = new Uint8Array(2);
  bytes[1] = value & 0xff;
  bytes[0] = (value >> 8) & 0xff;
  return bytes;
}
