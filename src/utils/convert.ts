import { TBinary } from '../../interfaces';
import { int16ToBytes, int32ToBytes } from './bytes';

export function booleanToBytes(input: boolean): Uint8Array {
  if (typeof input !== 'boolean') throw new Error('Boolean input is expected');

  return Uint8Array.from(input ? [1] : [0]);
}

export function shortToByteArray(input: number): Uint8Array {
  if (typeof input !== 'number') throw new Error('Numeric input is expected');
  return int16ToBytes(input);
}

export function integerToByteArray(input: number): Uint8Array {
  if (typeof input !== 'number') throw new Error('Numeric input is expected');
  return int32ToBytes(input);
}

export function bytesToByteArrayWithSize(input: TBinary): Uint8Array {
  if (!(input instanceof Array || input instanceof Uint8Array))
    throw new Error('Byte array or Uint8Array input is expected');
  else if (input instanceof Array && !input.every((n) => typeof n === 'number'))
    throw new Error('Byte array contains non-numeric elements');

  if (!(input instanceof Array)) input = Array.prototype.slice.call(input);

  const lengthBytes = shortToByteArray(input.length);
  return Uint8Array.from([...lengthBytes, ...(input as Array<number>)]);
}

export function byteArrayWithSizeToBytes(input: Uint8Array): Uint8Array {
  if (!(input instanceof Uint8Array)) throw new Error('Uint8Array input is expected');

  const lengthBytes = input.slice(0, 2);
  const length = (lengthBytes[0] << 8) | lengthBytes[1];

  return input.slice(2, length + 2);
}

export function longToByteArray(input: number): Uint8Array {
  if (typeof input !== 'number') throw new Error('Numeric input is expected');

  const bytes = new Array(7);
  for (let k = 7; k >= 0; k--) {
    bytes[k] = input & 255;
    input = input / 256;
  }

  return Uint8Array.from(bytes);
}

export function byteArrayToLong(input: Uint8Array): number {
  if (!(input instanceof Uint8Array)) throw new Error('Uint8Array input is expected');

  let result = 0;
  for (let i = 0; i < input.length; i++) {
    result = result * 256 + input[i];
  }

  return result;
}

export function stringToByteArray(input: string): Uint8Array {
  if (typeof input !== 'string') throw new Error('String input is expected');

  return new TextEncoder().encode(input);
}

export function stringToByteArrayWithSize(input: string): Uint8Array {
  if (typeof input !== 'string') throw new Error('String input is expected');

  const stringBytes = new TextEncoder().encode(input);
  const lengthBytes = int16ToBytes(stringBytes.length);

  return Uint8Array.from([...lengthBytes, ...stringBytes]);
}
