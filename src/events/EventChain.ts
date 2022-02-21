import { Account } from "../accounts";
import Event from "./Event";
import secureRandom from "../libs/secure-random";
import * as crypto from "../utils/crypto";
import base58 from "../libs/base58";

const EVENT_CHAIN_VERSION = 0x40;
const PROJECTION_ADDRESS_VERSION = 0x50;

export default class EventChain {
	public id: string;
	public events: Array<Event> = [];

	constructor(id: string) {
		this.id = id;
	}

	public static create(account: Account, nonce?: string): EventChain {
		const nonceBytes = nonce ? EventChain.createNonce(nonce) : EventChain.getRandomNonce();
		const id = crypto.buildEvenChainId(EVENT_CHAIN_VERSION, account.publicKey, nonceBytes);

		return new EventChain(id);
	}

	public createProjectionId(nonce?: string): string {
		const nonceBytes = nonce ? EventChain.createNonce(nonce) : EventChain.getRandomNonce();

		return crypto.buildEvenChainId(PROJECTION_ADDRESS_VERSION, this.id, nonceBytes);
	}

	public add(event: Event): Event {
		event.previous = this.getLatestHash();

		this.events.push(event);
		return event;
	}

	public getLatestHash(): string {
		return this.events.length == 0
			? base58.encode(crypto.sha256(base58.decode(this.id)))
			: this.events.slice(-1)[0].hash;
	}

	public set(data: any): EventChain {
		if (data.id)  this.id = data.id;

		(data.events ?? []).forEach(event => {
			this.events.push((<any>Object).assign(new Event(), event));
		});

		return this;
	}

	protected static createNonce(input: string): Uint8Array {
		return Uint8Array.from(crypto.sha256(input).slice(0, 20));
	}

	protected static getRandomNonce(): Uint8Array {
		return secureRandom.randomUint8Array(20);
	}
}
