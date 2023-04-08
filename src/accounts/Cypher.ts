export abstract class Cypher {
  public readonly keyType: TKeyType;

  protected constructor(keyType: TKeyType) {
    this.keyType = keyType;
  }

  abstract createSignature(input: Uint8Array): Uint8Array;
  abstract verifySignature(input: Uint8Array, signature: Uint8Array): boolean;

  abstract encryptMessage(input: Uint8Array, theirPublicKey: Uint8Array): Uint8Array;
  abstract decryptMessage(cypher: Uint8Array, theirPublicKey: Uint8Array): Uint8Array;
}
