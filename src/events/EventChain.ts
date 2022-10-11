import {IEventChainJSON, ISigner} from "../../interfaces";
import Event from "./Event";
import secureRandom from "../libs/secure-random";
import * as crypto from "../utils/crypto";
import Binary from "../Binary";

const EVENT_CHAIN_VERSION = 0x41;
const DERIVED_ID_VERSION = 0x51;

export default class EventChain {
	public id: string;
	public events: Array<Event> = [];

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

	public add(event: Event): EventChain {
		if (!event.previous) event.previous = this.latestHash;

		this.assertEvent(event);
		this.events.push(event);

		return this;
	}

	public get latestHash(): Binary {
		return this.events.length == 0
			? this.initialHash
			: this.events.slice(-1)[0].hash;
	}

	private get initialHash(): Binary {
		return Binary.fromBase58(this.id).hash();
	}

	public get subject(): Binary {
		return this.events.length == 0
			? this.initialSubject
			: this.events.slice(-1)[0].subject;
	}

	private get initialSubject(): Binary {
		return new Binary(Binary.fromBase58(this.id).reverse()).hash();
	}

	public set(data: Partial<IEventChainJSON>): EventChain {
		if (data.id) this.id = data.id;

		(data.events ?? []).forEach(eventData => {
			const event = Event.from(eventData);
			this.assertEvent(event);
			this.events.push(event);
		});

		return this;
	}

	protected assertEvent(event: Event): void {
		if (event.isSigned() && !event.verifySignature()) {
			throw new Error(`Invalid signature of event ${event.hash.base58}`);
		}

		if (
			(this.events.length > 0 && event.previous != this.latestHash) ||
			(this.events.length === 0 && !event.previous)
		) {
			throw new Error(`Event ${event.hash.base58} doesn't fit onto the chain`);
		}

		if (
			event.previous === this.initialHash &&
			!crypto.verifyEventChainId(EVENT_CHAIN_VERSION, this.id, event.signkey)
		) {
			throw new Error("Genesis event is not signed by chain creator");
		}
	}

	public isSigned(): boolean {
		return this.events.every(e => e.isSigned());
	}

	public partial(start: Binary) {
		const index = this.events.findIndex(e => e.hash.hex === start.hex);

		if (index < 0) {
			throw new Error(`Event ${start} is not part of this event chain`);
		}

		const chain = new EventChain(this.id);
		chain.events = this.events.slice(index);

		return chain;
	}

	public isPartial(): boolean {
		return this.events.length > 0 && this.events[0].previous !== this.initialHash;
	}

	public isCreatedBy(account: ISigner): boolean {
		return crypto.verifyEventChainId(EVENT_CHAIN_VERSION, this.id, Binary.fromBase58(account.publicKey));
	}

	public get anchorMap(): Array<{key: Binary, value: Binary}> {
		const map: Array<{key: Binary, value: Binary}> = [];
		let subject = this.initialSubject;

		for (const event of this.events) {
			map.push({key: subject, value: event.hash});
			subject = event.subject;
		}

		if (this.isPartial()) {
			map.shift(); // Subject of the first event is unknown in case of a partial event chain
		}

		return map;
	}

	public static from(data: IEventChainJSON[]): EventChain {
		return new EventChain("").set(data);
	}

	protected static createNonce(input: string): Uint8Array {
		return Uint8Array.from(crypto.sha256(input).slice(0, 20));
	}

	protected static getRandomNonce(): Uint8Array {
		return secureRandom.randomUint8Array(20);
	}
}
