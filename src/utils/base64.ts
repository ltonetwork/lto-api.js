import { TBinary } from '../types';

// Using native functions is faster than using the @scure/base

export function encode(buffer: TBinary): string {
  return typeof Buffer !== 'undefined'
    ? (buffer instanceof Buffer ? buffer : Buffer.from(buffer)).toString('base64')
    : btoa(String.fromCharCode.apply(null, Array.from(buffer)));
}

export function decode(message: string): Uint8Array {
  return typeof Buffer !== 'undefined'
    ? Buffer.from(message, 'base64').valueOf()
    : Uint8Array.from(atob(message), (c) => c.charCodeAt(0));
}
