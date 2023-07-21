import { TKeyType } from '../types';

export abstract class Cypher {
  readonly keyType: TKeyType;

  protected constructor(keyType: TKeyType) {
    this.keyType = keyType;
  }

  abstract createSignature(input: Uint8Array): Uint8Array;
  abstract verifySignature(input: Uint8Array, signature: Uint8Array): boolean;

  abstract encryptMessage(input: Uint8Array): Uint8Array;
  abstract decryptMessage(input: Uint8Array): Uint8Array;
}
