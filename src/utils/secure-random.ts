// @ts-nocheck
declare let require: any;

export function randomUint8Array(count: number): Uint8Array {
  const webcrypto = typeof self !== 'undefined' && typeof self.crypto !== 'undefined' ? self.crypto
    : typeof globalThis !== 'undefined' && typeof globalThis.crypto !== 'undefined' ? globalThis.crypto
    : typeof crypto !== 'undefined' ? crypto
    : {};

  if (typeof webcrypto.getRandomValues !== 'undefined') {
    const nativeArr = new Uint8Array(count);
    webcrypto.getRandomValues(nativeArr);
    return nativeArr;
  }

  const isNode =
    typeof process !== "undefined" &&
    process.versions != null &&
    process.versions.node != null;  
  
  if (isNode) {
    const crypto = require(/* webpackIgnore: true */ 'crypto');
    return new Uint8Array(crypto.randomBytes(count).buffer);
  }
  
  throw new Error("crypto.getRandomValues not supported. Please use a polyfill.");
}

