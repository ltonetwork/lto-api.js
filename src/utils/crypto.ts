import { IKeyPairBytes, IEvent } from '../../interfaces';

import * as CryptoJS from 'crypto-js';

import axlsign from '../libs/axlsign';
import base58 from '../libs/base58';
import base64 from '../libs/base64';
import * as blake from '../libs/blake2b';
import converters from '../libs/converters';
import secureRandom from '../libs/secure-random';
import { keccak256 } from '../libs/sha3';
import * as nacl from 'tweetnacl';

import { concatUint8Arrays } from './concat';
import config from '../config';

import * as constants from '../constants';

function sha256(input: Array<number> | Uint8Array | string): Uint8Array {

    let bytes;
    if (typeof input === 'string') {
        bytes = converters.stringToByteArray(input);
    } else {
        bytes = input;
    }

    const wordArray = converters.byteArrayToWordArrayEx(Uint8Array.from(bytes));
    const resultWordArray = CryptoJS.SHA256(wordArray);

    return converters.wordArrayToByteArrayEx(resultWordArray);

}

function blake2b(input) {
    return blake.blake2b(input, null, 32);
}

function keccak(input) {
    return (keccak256 as any).array(input);
}

function hashChain(input: Uint8Array): Array<number> {
    return keccak(blake2b(input));
}

function buildSeedHash(seedBytes: Uint8Array): Uint8Array {
    const nonce = new Uint8Array(converters.int32ToBytes(constants.INITIAL_NONCE, true));
    const seedBytesWithNonce = concatUint8Arrays(nonce, seedBytes);
    const seedHash = hashChain(seedBytesWithNonce);
    return sha256(seedHash);
}

function strengthenPassword(password: string, rounds: number = 5000): string {
    while (rounds--) password = converters.byteArrayToHexString(sha256(password));
    return password;
}

function compareByteArray(array1: Uint8Array | Array<any>, array2: Uint8Array | Array<any>) : boolean {
  for (let i = 0; i < array1.length; i++) {
    if (array1[i] !== array2[i]) {
      return false;
    }
  }
  return true;
}


export default {

    createSignature(dataBytes: Uint8Array, privateKey: string, encoding = 'base58'): string {
        if (!dataBytes || !(dataBytes instanceof Uint8Array)) {
        throw new Error('Missing or invalid data');
        }

        if (!privateKey || typeof privateKey !== 'string') {
        throw new Error('Missing or invalid private key');
        }

        const privateKeyBytes = base58.decode(privateKey);

        if (privateKeyBytes.length !== constants.PRIVATE_KEY_LENGTH) {
        throw new Error('Invalid public key');
        }

        const signature = nacl.sign.detached(dataBytes, privateKeyBytes);
        switch(encoding) {
        case 'base64':
          return base64.encode(signature);
        default:
          return base58.encode(signature);
        }
    },

    verifySignature(dataBytes: Uint8Array, signature: string, publicKey: string, encoding = 'base58'): boolean {
        if (!dataBytes || !(dataBytes instanceof Uint8Array)) {
          throw new Error('Missing or invalid data');
        }

        if (!publicKey || typeof publicKey !== 'string') {
          throw new Error('Missing or invalid public key');
        }

        const publicKeyBytes = base58.decode(publicKey);

        if (publicKeyBytes.length !== constants.PUBLIC_KEY_LENGTH) {
          throw new Error('Invalid public key');
        }

        let signatureBytes;
        switch (encoding) {
          case 'base64':
            signatureBytes = base64.decode(signature);
            break;

          default:
            signatureBytes = base58.decode(signature);
        }

        if (signatureBytes.length != 64) {
          throw new Error('Invalid signature');
        }

        return nacl.sign.detached.verify(dataBytes, signatureBytes, publicKeyBytes);
    },

    buildEventId(publicKey: string, randomBytes?: Uint8Array): string {

        if (!publicKey || typeof publicKey !== 'string') {
            throw new Error('Missing or invalid public key');
        }

        const prefix = Uint8Array.from([constants.EVENT_CHAIN_VERSION]);
        if (!randomBytes) {
            randomBytes = secureRandom.randomUint8Array(8);
        }

        const publicKeyBytes = base58.decode(publicKey);
        const publicKeyHashPart = Uint8Array.from(hashChain(publicKeyBytes).slice(0, 20));
        const rawId = concatUint8Arrays(prefix, randomBytes, publicKeyHashPart);
        const addressHash = Uint8Array.from(hashChain(rawId).slice(0, 4));

        return base58.encode(concatUint8Arrays(rawId, addressHash));
    },

    verifyEventId(transactionId: string, publicKey?: string): boolean {
      const idBytes = base58.decode(transactionId);

      if (idBytes[0] != constants.EVENT_CHAIN_VERSION) {
          return false;
      }

      const id = idBytes.slice(0, 29);
      const check = idBytes.slice(29, 33);
      const keyHash = hashChain(id).slice(0, 4);

      let res = compareByteArray(check, keyHash);

      if (publicKey) {
          const keyBytes = idBytes.slice(9, 29);
          const publicKeyBytes = Uint8Array.from(hashChain(base58.decode(publicKey)).slice(0, 20));
          res = res && compareByteArray(keyBytes, publicKeyBytes);
      }

      return res;
    },

    buildHash(eventBytes: Array<number> | Uint8Array | string, encoding = 'base58'): string {
        switch(encoding) {
          case 'base64':
                return base64.encode(sha256(eventBytes));
            default:
                return base58.encode(sha256(eventBytes));
        }
    },

    buildKeyPair(seed: string, curve=false, useNacl=false): IKeyPairBytes {

        if (!seed || typeof seed !== 'string') {
            throw new Error('Missing or invalid seed phrase');
        }

        const seedBytes = Uint8Array.from(converters.stringToByteArray(seed));
        const seedHash = buildSeedHash(seedBytes);
        let keys;
        if (!curve && useNacl) {
            keys = nacl.sign.keyPair.fromSeed(seedHash);
        } else {
          keys = axlsign.generateKeyPair(seedHash, curve);
        }

        return {
            privateKey: keys.private || keys.secretKey,
            publicKey: keys.public || keys.publicKey
        };

    },

    /*isValidAddress(address: string) {

        if (!address || typeof address !== 'string') {
            throw new Error('Missing or invalid address');
        }

        const addressBytes = base58.decode(address);

        if (addressBytes[0] !== 1 || addressBytes[1] !== config.getNetworkByte()) {
            return false;
        }

        const key = addressBytes.slice(0, 22);
        const check = addressBytes.slice(22, 26);
        const keyHash = hashChain(key).slice(0, 4);

        for (let i = 0; i < 4; i++) {
            if (check[i] !== keyHash[i]) {
                return false;
            }
        }

        return true;

    },*/

    buildRawAddress(publicKeyBytes: Uint8Array, networkByte: string): string {

        if (!publicKeyBytes || publicKeyBytes.length !== constants.PUBLIC_KEY_LENGTH || !(publicKeyBytes instanceof Uint8Array)) {
            throw new Error('Missing or invalid public key');
        }

        const prefix = Uint8Array.from([constants.ADDRESS_VERSION, networkByte.charCodeAt(0)]);
        const publicKeyHashPart = Uint8Array.from(hashChain(publicKeyBytes).slice(0, 20));

        const rawAddress = concatUint8Arrays(prefix, publicKeyHashPart);
        const addressHash = Uint8Array.from(hashChain(rawAddress).slice(0, 4));

        return base58.encode(concatUint8Arrays(rawAddress, addressHash));

    },

    encryptSeed(seed: string, password: string, encryptionRounds?: number): string {

        if (!seed || typeof seed !== 'string') {
            throw new Error('Seed is required');
        }

        if (!password || typeof password !== 'string') {
            throw new Error('Password is required');
        }

        password = strengthenPassword(password, encryptionRounds);
        return CryptoJS.AES.encrypt(seed, password).toString();

    },

    decryptSeed(encryptedSeed: string, password: string, encryptionRounds?: number): string {

        if (!encryptedSeed || typeof encryptedSeed !== 'string') {
            throw new Error('Encrypted seed is required');
        }

        if (!password || typeof password !== 'string') {
            throw new Error('Password is required');
        }

        password = strengthenPassword(password, encryptionRounds);
        const hexSeed = CryptoJS.AES.decrypt(encryptedSeed, password);
        return converters.hexStringToString(hexSeed.toString());

    },

    sha256(input: Array<number> | Uint8Array | string): Uint8Array {
        return sha256(input);
    },

    generateRandomUint32Array(length: number): Uint32Array {

        if (!length || length < 0) {
            throw new Error('Missing or invalid array length');
        }

        const a = secureRandom.randomUint8Array(length);
        const b = secureRandom.randomUint8Array(length);
        const result = new Uint32Array(length);

        for (let i = 0; i < length; i++) {
            const hash = converters.byteArrayToHexString(sha256(`${a[i]}${b[i]}`));
            const randomValue = parseInt(hash.slice(0, 13), 16);
            result.set([randomValue], i);
        }

        return result;

    }

}
