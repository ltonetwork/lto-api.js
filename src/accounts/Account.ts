import {IKeyPair, IKeyPairBytes, TBuffer} from "../interfaces";
import {EventChain} from "../events/EventChain";
import {Event} from "../events/Event";
import convert from "../utils/convert";
import crypto from "../utils/crypto";
import encoder from "../utils/encoder";

export class Account {
    /**
     * LTO Wallet Address
     */
    public readonly address: string;

    /**
     * LTO Network Byte
     */
    public readonly networkByte: string;

    /**
     * Signing keys
     */
    public readonly sign: IKeyPairBytes;

    /**
     * Encryption keys
     */
    public readonly encrypt: IKeyPairBytes;

    /**
     * Class for sign and verify
     */
    private readonly cypher: Cypher;

    /**
     * Seed
     */
    public readonly seed: string;

    /**
     * Random nonce
     */
    public readonly nonce: number;

    constructor(
        cypher: Cypher,
        address: string,
        sign: IKeyPairBytes,
        encrypt?: IKeyPairBytes,
        seed?: string,
        nonce: number = 0
    ) {
        this.cypher = cypher;
        this.address = address;
        this.networkByte = crypto.getNetwork(address)
        this.sign = sign;
        this.encrypt = encrypt;
        this.seed = seed;
        this.nonce = nonce;
    }

    /**
     * Create an event chain
     */
    public createEventChain(nonce?: string): EventChain {
        const eventChain = new EventChain();
        eventChain.init(this, nonce);

        return eventChain;
    }

    /**
     * Encrypt the seed with a password
     */
    public encryptSeed(password: string, encryptionRounds = 5000): string {
        return crypto.encryptSeed(this.seed, password, encryptionRounds);
    }

    /**
     * Get encoded seed
     */
    public getEncodedSeed(): string {
        return encoder.encode(Uint8Array.from(convert.stringToByteArray(this.seed)));
    }

    /**
     * Add a signature to the event
     */
    public signEvent(event: Event): Event {
        event.signkey = this.getPublicVerifyKey();

        const message = event.getMessage();
        event.signature = this.Sign(message);
        event.hash = event.getHash();
        return event;
    }

    /**
     * Verify a signature with a message
     */
    public Verify(signature: string, message: string | Uint8Array, encoding = "base58"): boolean {

        let requestBytes: Uint8Array;

        if (typeof message === "string")
            requestBytes = Uint8Array.from(convert.stringToByteArray(message));
        else
            requestBytes = message;


        return this.cypher.verifySignature(requestBytes, signature, encoding);
    }

    /**
     * Create a signature from a message
     */
    public Sign(message: string | Uint8Array, encoding = "base58") {
        return this.cypher.createSignature(message);
    }

    /**
     * Encrypts a message for a particular recipient
     */
    public encryptFor(recipient: Account, message: string): Uint8Array {
        return this.cypher.encryptMessage(message, recipient.getPublicEncryptKey(), crypto.randomNonce());
    }

    /**
     * Decrypts a message from a sender
     */
    public decryptFrom(sender: Account, message: Uint8Array): string {
        return this.cypher.decryptMessage(message);
    }

    /**
     * Get the (encoded) sign keys
     */
    public getSignKeys(encoding = "base58"): IKeyPair {
        return {
            privateKey: this.getPrivateSignKey(encoding),
            publicKey: this.getPublicVerifyKey(encoding)
        };
    }

    /**
     * Get the (encoded) encrypt keys
     */
    public getEncryptKeys(encoding = "base58"): IKeyPair {
        return {
            privateKey: this.getPrivateEncryptKey(encoding),
            publicKey: this.getPublicEncryptKey(encoding)
        };
    }

    /**
     * Get public sign key in the given encoding
     */
    public getPublicVerifyKey(encoding = "base58"): string {
        return encoder.encode(this.sign.publicKey, encoding);
    }

    public getCompressedPrivateKey(encoding = "base58"): string {
        let privKey = this.sign.privateKey;

        if (privKey.length == 64)
            return encoder.encode(new Uint8Array(privKey.slice(0, 32)), encoding);
        else
            return encoder.encode(privKey, encoding);
    }

    /**
     * Get private sign key in the given encoding
     */
    private getPrivateSignKey(encoding = "base58"): string {
        return encoder.encode(this.sign.privateKey, encoding);
    }

    /**
     * Get public encrypt key in the given encoding
     */
    public getPublicEncryptKey(encoding = "base58"): string {
        return encoder.encode(this.encrypt.publicKey, encoding);
    }

    /**
     * Get public encrypt key in the given encoding
     */
    public getPrivateEncryptKey(encoding = "base58"): string {
        return encoder.encode(this.encrypt.privateKey, encoding);
    }
}
