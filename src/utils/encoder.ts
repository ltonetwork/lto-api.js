import { base58 } from '@scure/base';
import * as base64 from '../utils/base64';
import { bytesToHex, hexToBytes } from '@noble/hashes/utils';

export enum Encoding {
  base58 = 'base58',
  base64 = 'base64',
  hex = 'hex',
}

export function encode(input: Uint8Array, encoding = Encoding.base58): string {
  switch (encoding) {
    case Encoding.base58:
      return base58.encode(input);
    case Encoding.base64:
      return base64.encode(input);
    case Encoding.hex:
      return bytesToHex(input);
  }
}

export function decode(input: string, encoding = Encoding.base58): Uint8Array {
  switch (encoding) {
    case Encoding.base58:
      return base58.decode(input);
    case Encoding.base64:
      return base64.decode(input);
    case Encoding.hex:
      return hexToBytes(input);
  }
}

export function recode(string: string, from: Encoding, to: Encoding): string {
  return encode(decode(string, from), to);
}

export function fromHex(hex: string): string {
  return decodeURIComponent(hex.replace(/(..)/g, '%$1'));
}

export function toHex(str: string): string {
  return unescape(encodeURIComponent(str))
    .split('')
    .map(function (v) {
      return v.charCodeAt(0).toString(16);
    })
    .join('');
}
