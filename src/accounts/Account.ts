import {Encoding, IKeyPairBytes} from "../interfaces";
import {EventChain} from "../events/EventChain";
import {Event} from "../events/Event";
import convert from "../utils/convert";
import * as crypto from "../utils/crypto";
import * as encoder from "../utils/encoder";
import { Cypher } from "./Cypher";

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
    public readonly signKeys: IKeyPairBytes;

    /**
     * Encryption keys
     */
    public readonly encryptKeys: IKeyPairBytes;

    /**
     * Class for sign and verify
     */
    protected cypher: Cypher;

    /**
     * Account key type
     */
    public readonly keyType: string;

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
        this.keyType = cypher.keyType;
        this.address = address;
        this.networkByte = crypto.getNetwork(address)
        this.signKeys = sign;
        this.encryptKeys = encrypt;
        this.seed = seed;
        this.nonce = nonce;
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
     * Create an event chain
     */
    public createEventChain(nonce?: string): EventChain {
        return EventChain.create(this, nonce);
    }

    /**
     * Verify a signature with a message
     */
    public verify(signature: string, message: string | Uint8Array, encoding = Encoding.base58): boolean {
        const requestBytes: Uint8Array = typeof message === "string"
            ? Uint8Array.from(convert.stringToByteArray(message))
            : message;

        return this.cypher.verifySignature(requestBytes, signature, encoding);
    }

    private signEvent(event: Event): Event {
        event.signkey = this.getPublicSignKey();
        event.signature = this.signMessage(event.getMessage());
        event.hash = event.getHash();

        return event;
    }

    private signMessage(message: string|Uint8Array, encoding = Encoding.base58): string {
        return this.cypher.createSignature(message, encoding);
    }

    /** Add a signature to the event */
    public sign(event: Event): Event;
    /** Create a signature from a message */
    public sign(message: string|Uint8Array, encoding?: Encoding): string;
    public sign(input: Event|string|Uint8Array, encoding = Encoding.base58): Event|string {
        return input instanceof Event
            ? this.signEvent(input)
            : this.signMessage(input, encoding);
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
        return this.cypher.decryptMessage(message, sender.getPrivateEncryptKey());
    }

    public get publicKey(): string {
        return this.getPublicSignKey();
    }

    public get privateKey(): string {
        return this.getPrivateSignKey();
    }

    /**
     * Get public sign key in the given encoding
     */
    public getPublicSignKey(encoding = Encoding.base58): string {
        return encoder.encode(this.signKeys.publicKey, encoding);
    }

    /**
     * Get private sign key in the given encoding
     */
    public getPrivateSignKey(encoding = Encoding.base58): string {
        return encoder.encode(this.signKeys.privateKey, encoding);
    }

    /**
     * Get public encrypt key in the given encoding
     */
    public getPublicEncryptKey(encoding = Encoding.base58): string {
        return encoder.encode(this.encryptKeys.publicKey, encoding);
    }

    /**
     * Get public encrypt key in the given encoding
     */
    public getPrivateEncryptKey(encoding = Encoding.base58): string {
        return encoder.encode(this.encryptKeys.privateKey, encoding);
    }
}
