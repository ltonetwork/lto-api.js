import {IBinary, IEventChainJSON, IEventJSON, ISigner} from "../../interfaces";
import Event from "./Event";
import secureRandom from "../libs/secure-random";
import Binary from "../Binary";
import MergeConflict from "./MergeConflict";
import {concatBytes, compareBytes} from "../utils/bytes";
import base58 from "../libs/base58";
import {sha256} from "../utils/sha256";
import {getNetwork, secureHash} from "../utils/crypto";
import {stringToByteArray} from "../utils/convert";

const EVENT_CHAIN_VERSION = 0x41;
const DERIVED_ID_VERSION = 0x51;

export default class EventChain {
	public readonly id: string;
	public readonly networkId: string;

	public events: Array<Event> = [];
	private partial?: { hash: IBinary, state: IBinary };

	constructor(id: string) {
		this.id = id;
		this.networkId = getNetwork(id);
	}

	public static create(account: ISigner, nonce?: string|Uint8Array): EventChain {
		const nonceBytes = typeof nonce !== "undefined" ? EventChain.createNonce(nonce) : EventChain.getRandomNonce();
		const id = EventChain.buildId(
			EVENT_CHAIN_VERSION,
			getNetwork(account.address),
			Binary.fromBase58(account.publicKey),
			nonceBytes
		);

		return new EventChain(id);
	}

	public createDerivedId(nonce?: string): string {
		const nonceBytes = nonce ? EventChain.createNonce(nonce) : EventChain.getRandomNonce();
		return EventChain.buildId(DERIVED_ID_VERSION, this.networkId, Binary.fromBase58(this.id), nonceBytes);
	}

	public isDerivedId(id: string): boolean {
		return EventChain.validateId(DERIVED_ID_VERSION, this.networkId, id, Binary.fromBase58(this.id));
	}

	public add(event: Event): EventChain
	public add(partialChain: EventChain): EventChain
	public add(input: Event|EventChain): EventChain {
		if (this.events.length > 0 && !this.latestEvent.isSigned())
			throw new Error("Unable to add event: last event on chain is not signed");

		if (input instanceof EventChain)
			this._addChain(input);
		else
			this._addEvent(input);

		return this;
	}

	private _addEvent(event: Event): void {
		if (!event.previous) event.previous = this.latestHash;

		this.assertEvent(event);
		this.events.push(event);
	}

	private _addChain(chain: EventChain): void {
		if (chain.id !== this.id)
			throw Error("Chain id mismatch");

		let offset = 0;
		if (chain.partial) {
			offset = this.events.findIndex(event => event.hash.hex === chain.partial.hash.hex) + 1;
			if (offset === 0)
				throw new Error(`Events don't fit onto this chain: Event ${chain.partial.hash.base58} not found`);
		}

		for (const [index, event] of chain.events.entries()) {
			if (!this.events[offset + index]) {
				this.assertEvent(event);
				this.events.push(event);
			} else if (this.events[offset + index].hash.hex !== event.hash.hex) {
				throw new MergeConflict(this, this.events[offset + index], chain.events[index]);
			}
		}
	}

	public has(event: IBinary|Event): boolean {
		const hash = event instanceof Event ? event.hash : event;
		return !!this.events.find(event => event.hash.hex === hash.hex);
	}

	public get latestHash(): Binary {
		return this.events.length == 0
			? (this.partial?.hash || this.initialHash)
			: this.events.slice(-1)[0].hash;
	}

	private get initialHash(): Binary {
		return Binary.fromBase58(this.id).hash();
	}

	private get latestEvent(): Event {
		return this.events[this.events.length - 1];
	}

	public get state(): Binary {
		return this.events.length == 0
			? (this.partial?.state || this.initialState)
			: this.stateAt(this.events[this.events.length - 1]);
	}

	private get initialState(): Binary {
		return Binary.fromBase58(this.id).reverse().hash();
	}

	protected stateAt(event: Event): Binary {
		if (!event.signature)
			throw new Error("Unable to get state: latest event is not signed");

		return event.signature.hash();
	}

	protected assertEvent(event: Event): void {
		if (!event.previous || event.previous.hex != this.latestHash.hex)
			throw new Error(`Event doesn't fit onto the chain after ${this.latestHash.base58}`);

		if (event.isSigned() && !event.verifySignature())
			throw new Error(`Invalid signature of event ${event.hash.base58}`);
	}

	public validate(): void {
		if (this.events.length === 0) {
			throw new Error("No events on event chain");
		}

		this.validateEvents();

		if (
			this.events[0].previous.hex === this.initialHash.hex &&
			!EventChain.validateId(EVENT_CHAIN_VERSION, this.networkId, this.id, this.events[0].signKey.publicKey)
		) {
			throw new Error("Genesis event is not signed by chain creator");
		}
	}

	private validateEvents(): void {
		let previous: Binary = this.partial?.hash || this.initialHash;

		for (const event of this.events) {
			if (!event.isSigned()) {
				let desc: string;
				try {
					desc = `Event ${event.hash.base58}`;
				} catch (e) {
					desc = (event === this.latestEvent ? "Last event" : `Event after ${previous.base58}`);
				}
				throw new Error(`${desc} is not signed`);
			}

			if (!event.verifySignature())
				throw new Error(`Invalid signature of event ${event.hash.base58}`);

			if (previous.hex !== event.previous.hex)
				throw new Error(`Event ${event.hash.base58} doesn't fit onto the chain`);

			previous = event.hash;
		}
	}

	public isSigned(): boolean {
		return this.events.every(e => e.isSigned());
	}

	public startingWith(start: Binary|Event) {
		const startHash = start instanceof Event ? start.hash : start;
		const index = this.events.findIndex(e => e.hash.hex === startHash.hex);

		if (index < 0) throw new Error(`Event ${startHash.hex} is not part of this event chain`);
		if (index === 0) return this;

		const chain = new EventChain(this.id);
		chain.partial = {
			hash: this.events[index - 1].hash,
			state: this.stateAt(this.events[index - 1]),
		};
		chain.events = this.events.slice(index);

		return chain;
	}

	public isPartial(): boolean {
		return !!this.partial;
	}

	public isCreatedBy(account: ISigner): boolean {
		return EventChain.validateId(
			EVENT_CHAIN_VERSION,
			getNetwork(account.address),
			this.id,
			Binary.fromBase58(account.publicKey)
		);
	}

	public get anchorMap(): Array<{key: Binary, value: Binary}> {
		const map: Array<{key: Binary, value: Binary}> = [];
		let state = this.partial?.state || this.initialState;

		for (const event of this.events) {
			map.push({key: state, value: event.hash});
			state = this.stateAt(event);
		}

		return map;
	}

	public toJSON(): IEventChainJSON {
		const events: Array<IEventJSON|{hash: string, state: string}> = this.events.map(event => event.toJSON());

		if (this.partial) {
			events.unshift({ hash: this.partial.hash.base58, state: this.partial.state.base58 });
		}

		return { id: this.id, events };
	}

	public static from(data: IEventChainJSON): EventChain {
		const chain = new EventChain(data.id);

		if (data.events.length === 0) return chain;

		if ("state" in data.events[0]) {
			const partial = data.events.shift() as {hash: string, state: string};
			chain.partial = {
				hash: Binary.fromBase58(partial.hash),
				state: Binary.fromBase58(partial.state),
			};
		}

		for (const eventData of (data.events ?? []) as IEventJSON[]) {
			chain.events.push(Event.from(eventData));
		}

		return chain;
	}

	protected static createNonce(input: string|Uint8Array): Uint8Array {
		return Uint8Array.from(sha256(input).slice(0, 20));
	}

	protected static getRandomNonce(): Uint8Array {
		return secureRandom.randomUint8Array(20);
	}

	private static buildId(prefix: number, network: string, group: Uint8Array, randomBytes: Uint8Array): string {
		if (randomBytes.length !== 20)
			throw new Error("Random bytes should have a length of 20");

		const prefixBytes = Uint8Array.from([prefix]);
		const networkBytes = stringToByteArray(network);

		const publicKeyHashPart = secureHash(group).slice(0, 20);
		const rawId = concatBytes(prefixBytes, networkBytes, randomBytes, publicKeyHashPart);
		const addressHash = secureHash(rawId).slice(0, 4);

		return base58.encode(concatBytes(rawId, addressHash));
	}

	private static validateId(prefix: number, network: string, id: string, group?: Uint8Array): boolean {
		const idBytes = base58.decode(id);

		if (idBytes.length !== 46 || idBytes[0] !== prefix || String.fromCharCode(idBytes[1]) !== network)
			return false;

		const rawId = idBytes.slice(0, 42);
		const check = idBytes.slice(42);
		const addressHash = secureHash(rawId).slice(0, 4);

		let res = compareBytes(check, addressHash);

		if (res && group) {
			const keyBytes = rawId.slice(22);
			const publicKeyHashPart = Uint8Array.from(secureHash(group).slice(0, 20));

			res = compareBytes(keyBytes, publicKeyHashPart);
		}

		return res;
	}
}
