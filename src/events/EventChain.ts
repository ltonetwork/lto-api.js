import {IBinary, IEventChainJSON, IEventJSON, ISigner} from "../../interfaces";
import Event from "./Event";
import secureRandom from "../libs/secure-random";
import * as crypto from "../utils/crypto";
import Binary from "../Binary";
import MergeConflict from "./MergeConflict";

const EVENT_CHAIN_VERSION = 0x41;
const DERIVED_ID_VERSION = 0x51;

export default class EventChain {
	public id: string;
	public events: Array<Event> = [];
	private partial?: { hash: IBinary, subject: IBinary };

	constructor(id: string) {
		this.id = id;
	}

	public static create(account: ISigner, nonce?: string): EventChain {
		const nonceBytes = nonce ? EventChain.createNonce(nonce) : EventChain.getRandomNonce();
		const id = crypto.buildEvenChainId(EVENT_CHAIN_VERSION, Binary.fromBase58(account.publicKey), nonceBytes);

		return new EventChain(id);
	}

	public createDerivedId(nonce?: string): string {
		const nonceBytes = nonce ? EventChain.createNonce(nonce) : EventChain.getRandomNonce();
		return crypto.buildEvenChainId(DERIVED_ID_VERSION, Binary.fromBase58(this.id), nonceBytes);
	}

	public isDerivedId(id: string): boolean {
		return crypto.verifyEventChainId(DERIVED_ID_VERSION, id, Binary.fromBase58(this.id));
	}

	public add(event: Event): EventChain
	public add(partialChain: EventChain): EventChain
	public add(input: Event|EventChain): EventChain {
		if (input instanceof EventChain)
			this._addChain(input);
		else
			this._addEvent(input);

		return this;
	}

	public has(hash: IBinary): boolean {
		return !!this.events.find(event => event.hash.hex === hash.hex);
	}

	private _addEvent(event: Event): void {
		if (!event.previous) event.previous = this.latestHash;

		this.assertEvent(event);
		this.events.push(event);
	}

	private _addChain(chain: EventChain): void {
		if (chain.id !== this.id)
			throw Error("Chain id mismatch");

		const offset = chain.partial ? this.events.findIndex(event => event.hash.hex === chain.partial.hash.hex) : 0;
		if (offset < 0) throw new Error(`Events don't fit onto this chain: Event ${chain.partial.hash.hex} not found`);

		for (const [index, event] of chain.events.entries()) {
			if (!this.events[offset + index]) {
				this.events.push(event);
			} else if (this.events[offset + index].hash.hex !== event.hash.hex) {
				throw new MergeConflict(this, this.events[offset + index], chain.events[index]);
			}
		}
	}

	public get latestHash(): Binary {
		return this.events.length == 0
			? (this.partial?.hash || this.initialHash)
			: this.events.slice(-1)[0].hash;
	}

	private get initialHash(): Binary {
		return Binary.fromBase58(this.id).hash();
	}

	public get subject(): Binary {
		return this.events.length == 0
			? (this.partial?.subject || this.initialSubject)
			: this.events.slice(-1)[0].subject;
	}

	private get initialSubject(): Binary {
		return new Binary(Binary.fromBase58(this.id).reverse()).hash();
	}

	protected assertEvent(event: Event): void {
		if (event.isSigned() && !event.verifySignature()) {
			throw new Error(`Invalid signature of event ${event.hash.base58}`);
		}

		if (!event.previous) {
			throw new Error(`Previous hash not set of event ${event.hash.base58}`);
		}

		if (event.previous.hex != this.latestHash.hex) {
			throw new Error(`Event ${event.hash.base58} doesn't fit onto the chain`);
		}

		if (
			event.previous.hex === this.initialHash.hex &&
			!crypto.verifyEventChainId(EVENT_CHAIN_VERSION, this.id, event.signKey.publicKey)
		) {
			throw new Error("Genesis event is not signed by chain creator");
		}
	}

	public validate(): void {
		let previous: Binary;

		if (this.events.length === 0) {
			throw new Error("No events on event chain");
		}

		if (
			this.events[0].previous === this.initialHash &&
			!crypto.verifyEventChainId(EVENT_CHAIN_VERSION, this.id, this.events[0].signKey.publicKey)
		) {
			throw new Error("Genesis event is not signed by chain creator");
		}

		for (const event of this.events) {
			if (!event.isSigned()) {
				throw new Error(`Event ${event.hash.base58} is not signed`);
			}

			if (!event.verifySignature()) {
				throw new Error(`Invalid signature of event ${event.hash.base58}`);
			}

			if (previous && previous.hex !== event.previous.hex) {
				throw new Error(`Event ${event.hash.base58} doesn't fit onto the chain`);
			}

			previous = event.hash;
		}
	}

	public isSigned(): boolean {
		return this.events.every(e => e.isSigned());
	}

	public startingWith(start: Binary) {
		const index = this.events.findIndex(e => e.hash.hex === start.hex);

		if (index < 0) throw new Error(`Event ${start.hex} is not part of this event chain`);
		if (index === 0) return this;

		const chain = new EventChain(this.id);
		chain.partial = {
			hash: this.events[index - 1].hash,
			subject: this.events[index - 1].subject,
		};
		chain.events = this.events.slice(index);

		return chain;
	}

	public isPartial(): boolean {
		return !!this.partial;
	}

	public isCreatedBy(account: ISigner): boolean {
		return crypto.verifyEventChainId(EVENT_CHAIN_VERSION, this.id, Binary.fromBase58(account.publicKey));
	}

	public get anchorMap(): Array<{key: Binary, value: Binary}> {
		const map: Array<{key: Binary, value: Binary}> = [];
		let subject = this.partial?.subject || this.initialSubject;

		for (const event of this.events) {
			map.push({key: subject, value: event.hash});
			subject = event.subject;
		}

		return map;
	}

	public toJSON(): IEventChainJSON {
		const events: Array<IEventJSON|{hash: string, subject: string}> = this.events.map(event => event.toJSON());

		if (this.partial) {
			events.unshift({ hash: this.partial.hash.base58, subject: this.partial.subject.base58 });
		}

		return { id: this.id, events };
	}

	public static from(data: IEventChainJSON): EventChain {
		const chain = new EventChain(data.id);

		if ("subject" in data.events[0]) {
			const partial = data.events.shift() as {hash: string, subject: string};
			chain.partial = {
				hash: Binary.fromBase58(partial.hash),
				subject: Binary.fromBase58(partial.subject),
			};
		}

		for (const eventData of (data.events ?? []) as IEventJSON[]) {
			chain._addEvent(Event.from(eventData));
		}

		return chain;
	}

	protected static createNonce(input: string): Uint8Array {
		return Uint8Array.from(crypto.sha256(input).slice(0, 20));
	}

	protected static getRandomNonce(): Uint8Array {
		return secureRandom.randomUint8Array(20);
	}
}
