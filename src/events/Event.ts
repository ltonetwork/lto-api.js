import base58 from "../libs/base58";
import * as crypto from "../utils/crypto";
import * as convert from "../utils/convert";

import {Account} from "../accounts/Account";
import {EventChain} from "./EventChain";
import Binary from "../Binary";
import {ED25519} from "../accounts/ed25519/ED25519";

export class Event {
    /**
     * Base58 encoded JSON string with the body of the event.
     */
    public body: string;

    /**
     * Time when the event was signed.
     */
    public timestamp: number;

    /**
     * Hash to the previous event
     */
    public previous: string;

    /**
     * Base58 encoded public key used to sign the event
     */
    public signkey?: string;

    /**
     * Base58 encoded signature of the event
     */
    public signature?: string;

    private _hash?: string;

    constructor(body?: any, previous?: string) {
        if (body) this.body = base58.encode(convert.stringToByteArray(JSON.stringify(body)));
        this.previous = previous;
        this.timestamp = Date.now();
    }

    public get message(): string {
        if (!this.body)
            throw new Error("Body unknown");

        if (!this.signkey)
            throw new Error("First set signkey before creating message");

        return [
            this.body,
            this.timestamp,
            this.previous,
            this.signkey
        ].join("\n");
    }

    /**
     * Base58 encoded SHA256 hash of the event
     */
    public get hash(): string {
        return this._hash ?? base58.encode(crypto.sha256(this.message));
    }

    public verifySignature(): boolean {
        if (!this.signature || !this.signkey) {
            throw new Error('Signature and/or signkey not set');
        }

        const cypher = new ED25519({publicKey: Binary.fromBase58(this.signkey)});
        return cypher.verifySignature(new Binary(this.message), Binary.fromBase58(this.signature));
    }

    public getResourceVersion(): string {
        return base58.encode(crypto.sha256(this.body)).slice(0, 8);
    }

    public getBody(): any {
        return JSON.parse(String.fromCharCode.apply(null, base58.decode(this.body)));
    }

    public signWith(account: Account): this {
        this.signkey = account.signKeys.publicKey.base58;
        this.signature = account.sign(this.message).base58;
        this._hash = this.hash

        return this;
    }

    public addTo(chain: EventChain): this {
        chain.add(this);
        return this;
    }
}
