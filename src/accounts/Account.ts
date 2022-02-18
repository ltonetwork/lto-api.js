import {IKeyPairBytes} from "../../interfaces";
import {EventChain} from "../events/EventChain";
import {Event} from "../events/Event";
import * as crypto from "../utils/crypto";
import { Encoding, encode } from "../utils/encoder";
import { Cypher } from "./Cypher";
import converters from "../libs/converters";
import Binary from "../Binary";
import Transaction from "../transactions/Transaction";

export default class Account {
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
     * Seed phrase
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
    public getEncodedSeed(encoding = Encoding.base58): string {
        return encode(Uint8Array.from(converters.stringToByteArray(this.seed)), encoding);
    }

    /**
     * Create an event chain
     */
    public createEventChain(nonce?: string): EventChain {
        return EventChain.create(this, nonce);
    }

    private signMessage(message: string|Uint8Array): Binary {
        return new Binary(
            this.cypher.createSignature(new Binary(message))
        );
    }

    public sign(message: string|Uint8Array): Binary;
    public sign(event: Event): Event;
    public sign<T extends Transaction>(tx: T): T;
    public sign(input: string|Uint8Array|Event|Transaction): Binary|Event|Transaction {
        return input instanceof Event || input instanceof Transaction
            ? input.signWith(this)
            : this.signMessage(input);
    }

    /**
     * Verify a signature with a message
     */
    public verify(message: string|Uint8Array, signature: Uint8Array): boolean {
        return this.cypher.verifySignature(new Binary(message), signature);
    }

    /**
     * Encrypts a message for a particular recipient
     */
    public encryptFor(recipient: Account, message: string|Uint8Array): Binary {
        return new Binary(
            this.cypher.encryptMessage(new Binary(message), recipient.encryptKeys.publicKey)
        );
    }

    /**
     * Decrypts a message from a sender
     */
    public decryptFrom(sender: Account, message: Uint8Array): Binary {
        return new Binary(
            this.cypher.decryptMessage(message, sender.encryptKeys.publicKey)
        );
    }

    /**
     * Base58 encoded public sign key
     */
    public get publicKey(): string {
        return this.signKeys.publicKey.base58;
    }

    /**
     * Base58 encoded private sign key
     */
    public get privateKey(): string {
        return this.signKeys.privateKey.base58;
    }
}
