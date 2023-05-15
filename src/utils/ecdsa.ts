import { secp256k1 } from '@noble/curves/secp256k1';
import { bytesToNumberBE } from '@noble/curves/abstract/utils';

export function compressPublicKey(pubKey: Uint8Array): Uint8Array {
  if (pubKey[0] !== 0x04) {
    throw new Error('Invalid uncompressed public key');
  }

  const x = pubKey.slice(1, 33);
  const y = pubKey.slice(33);

  const isYOdd = (y[y.length - 1] & 1) === 1;
  const prefix = isYOdd ? 0x03 : 0x02;

  return Uint8Array.from([prefix, ...x]);
}

export function decompressPublicKey(
  compressedPublicKey: Uint8Array,
  curve: typeof secp256k1.CURVE = secp256k1.CURVE,
): Uint8Array {
  const len = compressedPublicKey.length;
  const head = compressedPublicKey[0];
  const tail = compressedPublicKey.slice(1);

  if (len === 33 && (head === 0x02 || head === 0x03)) {
    const x = bytesToNumberBE(tail);
    const Fp = curve.Fp;
    const y2 = Fp.add(Fp.add(Fp.mul(Fp.mul(x, x), x), Fp.mul(curve.a, x)), curve.b);
    let y = Fp.sqrt(y2);
    const isYOdd = (y & 1n) === 1n;
    const isHeadOdd = (head & 1) === 1;

    if (isHeadOdd !== isYOdd) y = Fp.neg(y);

    const xBytes = Fp.toBytes(x);
    const yBytes = Fp.toBytes(y);

    return Uint8Array.from([0x04, ...xBytes, ...yBytes]);
  } else {
    throw new Error('Invalid compressed public key');
  }
}
