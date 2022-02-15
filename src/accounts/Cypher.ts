export abstract class Cypher {
    public readonly keyType: string;

    protected constructor(keyType: string) {
        this.keyType = keyType;
    }

    abstract createSignature(input: string|Uint8Array, encoding?: string): string;

    abstract verifySignature(
        input: string | Uint8Array,
        signature: string | Uint8Array,
        encoding?: string
    ): boolean;

    abstract encryptMessage(
        message: string | Uint8Array,
        theirPublicKey: string,
        nonce: Uint8Array
    ): Uint8Array;

    abstract decryptMessage(cypher: Uint8Array, theirPublicKey: string): string;
}
