import { randomUint8Array } from '../libs/secure-random';
import { sha256 } from '@noble/hashes/sha256';
import { bytesToHex } from '@noble/hashes/utils';

export function compareBytes(array1: Uint8Array | Array<any>, array2: Uint8Array | Array<any>): boolean {
  return array1.every((c, i) => c === array2[i]);
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
    const hash = bytesToHex(sha256(`${a[i]}${b[i]}`));
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
