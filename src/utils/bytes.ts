import { sha256 } from '@noble/hashes/sha256';
import { bytesToHex, randomBytes } from '@noble/hashes/utils';

export function compareBytes(array1: Uint8Array | Array<any>, array2: Uint8Array | Array<any>): boolean {
  return array1.length === array2.length && array1.every((c, i) => c === array2[i]);
}

export function generateRandomUint32Array(length: number): Uint32Array {
  if (!length || length < 0) throw new Error('Missing or invalid array length');

  const a = randomBytes(length);
  const b = randomBytes(length);
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

export function bytesToInt(bytes: Uint8Array): number {
  let value = 0;
  for (let i = 0; i < bytes.length; i++) {
    value += bytes[i] << (8 * (bytes.length - i - 1));
  }
  return value;
}
