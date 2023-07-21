import { base58 } from '@scure/base';
import { compareBytes } from './bytes';
import { concatBytes } from '@noble/hashes/utils';
import * as constants from '../constants';
import { sha256 } from '@noble/hashes/sha256';
import { blake2b } from '@noble/hashes/blake2b';
import { TKeyType } from '../types';

const ADDRESS_VERSION = 1;

export function secureHash(input: Uint8Array | string): Uint8Array {
  return sha256(blake2b(input, { dkLen: 32 }));
}

export function isValidAddress(address: string, networkId?: string | number) {
  if (!address || typeof address !== 'string') throw new Error('Missing or invalid address');

  const networkByte = typeof networkId === 'string' ? networkId.charCodeAt(0) : networkId;
  const addressBytes = base58.decode(address);

  if (addressBytes[0] !== ADDRESS_VERSION) return false;
  if (networkByte !== undefined && addressBytes[1] !== networkByte) return false;

  const key = addressBytes.slice(0, 22);
  const check = addressBytes.slice(22, 26);
  const keyHash = secureHash(key).slice(0, 4);

  return compareBytes(keyHash, check);
}

export function buildAddress(publicKeyBytes: Uint8Array, networkId: string): string {
  if (
    !publicKeyBytes ||
    (publicKeyBytes.length !== constants.PUBLIC_KEY_LENGTH &&
      publicKeyBytes.length !== constants.PUBLIC_KEY_LENGTH_ECDSA &&
      publicKeyBytes.length !== constants.UNCOMPRESSED_PUBLIC_KEY_LENGTH_ECDSA) ||
    !(publicKeyBytes instanceof Uint8Array)
  ) {
    throw new Error('Missing or invalid public key');
  }

  const prefix = Uint8Array.from([constants.ADDRESS_VERSION, networkId.charCodeAt(0)]);
  const publicKeyHashPart = secureHash(publicKeyBytes).slice(0, 20);

  const rawAddress = concatBytes(prefix, publicKeyHashPart);
  const addressHash = secureHash(rawAddress).slice(0, 4);

  return base58.encode(concatBytes(rawAddress, addressHash));
}

export function getNetwork(address: string): string {
  const decodedAddress = base58.decode(address);
  return String.fromCharCode(decodedAddress[1]);
}

export function keyTypeId(keyType: TKeyType): number {
  const types: Record<TKeyType, number> = {
    ed25519: 1,
    secp256k1: 2,
    secp256r1: 3,
  };

  if (!(keyType in types)) throw Error('Key type not supported');

  return types[keyType];
}

export function keyTypeFromId(keyTypeId: number): TKeyType {
  const types: Record<number, TKeyType> = {
    1: 'ed25519',
    2: 'secp256k1',
    3: 'secp256r1',
  };

  if (!(keyTypeId in types)) throw Error('Key type not supported');

  return types[keyTypeId];
}
