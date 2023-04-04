export abstract class Cypher {
  public readonly keyType: string;

  protected constructor(keyType: string) {
    this.keyType = keyType;
  }

  abstract createSignature(input: Uint8Array): Uint8Array;
  abstract verifySignature(input: Uint8Array, signature: Uint8Array): boolean;

  abstract encryptMessage(input: Uint8Array, theirPublicKey: Uint8Array): Uint8Array;
  abstract decryptMessage(cypher: Uint8Array, theirPublicKey: Uint8Array): Uint8Array;
}
