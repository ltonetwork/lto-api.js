import { IBinary, IEventChainJSON, IEventJSON, ISigner } from '../types';
import Event from './Event';
import Binary from '../Binary';
import MergeConflict from './MergeConflict';
import { concatBytes, randomBytes } from '@noble/hashes/utils';
import { compareBytes } from '../utils/bytes';
import { base58 } from '@scure/base';
import { sha256 } from '@noble/hashes/sha256';
import { buildAddress, getNetwork, secureHash } from '../utils/crypto';
import { stringToByteArray } from '../utils/convert';

export const EVENT_CHAIN_V1 = 0x41;
export const EVENT_CHAIN_V2 = 0x42;
const DERIVED_ID_VERSION = 0x51;

export default class EventChain {
  readonly id: string;
  readonly networkId: string;

  events: Array<Event> = [];
  private partial?: { hash: IBinary; state: IBinary };

  constructor(id: string);
  constructor(account: ISigner, nonce?: string | Uint8Array);
  constructor(idOrAccount: string | ISigner, nonce?: string | Uint8Array) {
    if (typeof idOrAccount === 'string') {
      this.id = idOrAccount;
      this.networkId = getNetwork(this.id);
    } else {
      const account = idOrAccount;
      const nonceBytes = typeof nonce !== 'undefined' ? EventChain.createNonce(nonce) : EventChain.getRandomNonce();

      this.networkId = getNetwork(account.address);
      this.id = EventChain.buildId(EVENT_CHAIN_V2, this.networkId, Binary.fromBase58(account.publicKey), nonceBytes);
    }
  }

  get version(): number {
    return Binary.fromBase58(this.id)[0];
  }

  /** @deprecated */
  static create(account: ISigner, nonce?: string | Uint8Array): EventChain {
    return new EventChain(account, nonce);
  }

  createDerivedId(nonce?: string): string {
    const nonceBytes = nonce ? EventChain.createNonce(nonce) : EventChain.getRandomNonce();
    return EventChain.buildId(DERIVED_ID_VERSION, this.networkId, Binary.fromBase58(this.id), nonceBytes);
  }

  isDerivedId(id: string): boolean {
    return EventChain.validateId(DERIVED_ID_VERSION, this.networkId, id, Binary.fromBase58(this.id));
  }

  add(eventOrChain: Event | EventChain): EventChain {
    if (this.events.length > 0 && !this.latestEvent.isSigned())
      throw new Error('Unable to add event: last event on chain is not signed');

    if (eventOrChain instanceof EventChain) {
      this.addChain(eventOrChain);
    } else {
      this.addEvent(eventOrChain);
    }

    return this;
  }

  private addEvent(event: Event): void {
    if (!event.previous) event.previous = this.latestHash;
    (event as any).version = this.version;

    this.assertEvent(event);
    this.events.push(event);
  }

  private addChain(chain: EventChain): void {
    if (chain.id !== this.id) throw Error('Chain id mismatch');

    let offset = 0;
    if (chain.partial) {
      offset = this.events.findIndex((event) => event.hash.hex === chain.partial.hash.hex) + 1;
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

  has(event: IBinary | Event): boolean {
    const hash = event instanceof Event ? event.hash : event;
    return !!this.events.find((event) => event.hash.hex === hash.hex);
  }

  get latestHash(): Binary {
    return this.events.length == 0 ? this.partial?.hash || this.initialHash : this.events.slice(-1)[0].hash;
  }

  private get initialHash(): Binary {
    return Binary.fromBase58(this.id).hash();
  }

  private get latestEvent(): Event {
    return this.events[this.events.length - 1];
  }

  get state(): Binary {
    if (this.events.length > 0 && !this.events[this.events.length - 1].isSigned()) {
      throw new Error('Unable to get state: last event on chain is not signed');
    }

    return this.stateAt(this.events.length);
  }

  private get initialState(): Binary {
    return Binary.fromBase58(this.id).reverse().hash();
  }

  protected stateAt(length: number): Binary {
    if (length > this.events.length) throw new Error('Unable to get state: out of bounds');

    const initial = this.partial?.state ?? this.initialState;
    return this.events.slice(0, length).reduce((state, event) => Binary.concat(state, event.hash).hash(), initial);
  }

  protected assertEvent(event: Event): void {
    if (!event.previous || event.previous.hex != this.latestHash.hex)
      throw new Error(`Event doesn't fit onto the chain after ${this.latestHash.base58}`);

    if (!event.verifyHash()) throw new Error(`Invalid hash of event ${event.hash.base58}`);

    if (event.isSigned() && !event.verifySignature())
      throw new Error(`Invalid signature of event ${event.hash.base58}`);
  }

  validate(): void {
    if (this.events.length === 0) throw new Error('No events on event chain');

    this.validateEvents();
    if (this.events[0].previous.hex === this.initialHash.hex) this.validateGenesis();
  }

  private validateEvents(): void {
    let previous: Binary = this.partial?.hash ?? this.initialHash;

    for (const event of this.events) {
      if (!event.isSigned()) {
        let desc: string;
        try {
          desc = `Event ${event.hash.base58}`;
        } catch (e) {
          desc = event === this.latestEvent ? 'Last event' : `Event after ${previous.base58}`;
        }
        throw new Error(`${desc} is not signed`);
      }

      if (!event.verifyHash()) throw new Error(`Invalid hash of event ${event.hash.base58}`);
      if (!event.verifySignature()) throw new Error(`Invalid signature of event ${event.hash.base58}`);
      if (previous.hex !== event.previous.hex) throw new Error(`Event ${event.hash.base58} doesn't fit onto the chain`);

      previous = event.hash;
    }
  }

  private validateGenesis(): void {
    const isValid =
      EventChain.validateId(EVENT_CHAIN_V2, this.networkId, this.id, this.events[0].signKey.publicKey) ||
      EventChain.validateId(EVENT_CHAIN_V1, this.networkId, this.id, this.events[0].signKey.publicKey);

    if (!isValid) throw new Error('Genesis event is not signed by chain creator');
  }

  isSigned(): boolean {
    return this.events.every((e) => e.isSigned());
  }

  startingWith(start: Binary | Event): EventChain {
    return this.createPartial(start, 0);
  }

  startingAfter(start: Binary | Event): EventChain {
    return this.createPartial(start, 1);
  }

  private createPartial(start: Binary | Event, offset: number): EventChain {
    const startHash = start instanceof Event ? start.hash : start;

    if (this.initialHash.hex === startHash.hex) return this;

    const foundIndex = this.events.findIndex((e) => e.hash.hex === startHash.hex);
    if (foundIndex < 0) throw new Error(`Event ${startHash.hex} is not part of this event chain`);

    const index = foundIndex + offset;
    if (index === 0) return this;

    const chain = new EventChain(this.id);
    chain.partial = {
      hash: this.events[index - 1].hash,
      state: this.stateAt(index),
    };
    chain.events = this.events.slice(index);

    return chain;
  }

  isPartial(): boolean {
    return !!this.partial;
  }

  isCreatedBy(account: ISigner): boolean {
    const networkId = getNetwork(account.address);
    const publicKey = Binary.fromBase58(account.publicKey);

    return (
      EventChain.validateId(EVENT_CHAIN_V2, networkId, this.id, publicKey) ||
      EventChain.validateId(EVENT_CHAIN_V1, networkId, this.id, publicKey)
    );
  }

  get anchorMap(): Array<{ key: Binary; value: Binary; signer: string }> {
    const map: Array<{ key: Binary; value: Binary; signer: string }> = [];
    let state = this.partial?.state ?? this.initialState;

    for (const event of this.events) {
      map.push({ key: state, value: event.hash, signer: buildAddress(event.signKey.publicKey, this.networkId) });
      state = Binary.concat(state, event.hash).hash();
    }

    return map;
  }

  toJSON(): IEventChainJSON {
    const events: Array<IEventJSON | { hash: string; state: string }> = this.events.map((event) => event.toJSON());

    if (this.partial) events.unshift({ hash: this.partial.hash.base58, state: this.partial.state.base58 });

    return { id: this.id, events };
  }

  static from(data: IEventChainJSON): EventChain {
    const chain = new EventChain(data.id);
    const chainVersion = chain.version;

    if (data.events.length === 0) return chain;

    if ('state' in data.events[0]) {
      const partial = data.events.shift() as { hash: string; state: string };
      chain.partial = {
        hash: Binary.fromBase58(partial.hash),
        state: Binary.fromBase58(partial.state),
      };
    }

    for (const eventData of (data.events ?? []) as IEventJSON[]) {
      chain.events.push(Event.from(eventData, chainVersion));
    }

    return chain;
  }

  protected static createNonce(input: string | Uint8Array): Uint8Array {
    return Uint8Array.from(sha256(input).slice(0, 20));
  }

  protected static getRandomNonce(): Uint8Array {
    return randomBytes(20);
  }

  private static buildId(prefix: number, network: string, group: Uint8Array, randomBytes: Uint8Array): string {
    if (randomBytes.length !== 20) throw new Error('Random bytes should have a length of 20');

    const prefixBytes = Uint8Array.from([prefix]);
    const networkBytes = stringToByteArray(network);

    const publicKeyHashPart = secureHash(group).slice(0, 20);
    const rawId = concatBytes(prefixBytes, networkBytes, randomBytes, publicKeyHashPart);
    const addressHash = secureHash(rawId).slice(0, 4);

    return base58.encode(concatBytes(rawId, addressHash));
  }

  private static validateId(prefix: number, network: string, id: string, group?: Uint8Array): boolean {
    const idBytes = base58.decode(id);

    if (idBytes.length !== 46 || idBytes[0] !== prefix || String.fromCharCode(idBytes[1]) !== network) return false;

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
