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
		if (event.signature && !event.verifySignature()) {
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

	public isPartial(): boolean {
		return this.events.length > 0 && this.events[0].previous !== this.initialHash;
	}

	public isCreatedBy(account: ISigner): boolean {
		return crypto.verifyEventChainId(EVENT_CHAIN_VERSION, this.id, Binary.fromBase58(account.publicKey));
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
