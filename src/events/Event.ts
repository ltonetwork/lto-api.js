import * as convert from '../utils/convert';

import { IBinary, IEventJSON, ISigner, TKeyType } from '../../interfaces';
import EventChain from './EventChain';
import Binary from '../Binary';
import { concatBytes } from '@noble/hashes/utils';
import { keyTypeId } from '../utils/crypto';
import { cypher } from '../accounts';

export default class Event {
  /** Meta type of the data */
  mediaType: string;

  /** Data of the event */
  data: IBinary;

  /** Time when the event was signed */
  timestamp?: number;

  /** Hash to the previous event */
  previous?: IBinary;

  /** key and its type used to sign the event */
  signKey?: { keyType: TKeyType; publicKey: IBinary };

  /** Signature of the event */
  signature?: IBinary;

  /** Hash (see dynamic property) */
  private _hash?: IBinary;

  constructor(data: any, mediaType?: string, previous?: string | Uint8Array) {
    if (data instanceof Binary) {
      this.mediaType = mediaType ?? 'application/octet-stream';
      this.data = data;
    } else {
      if (mediaType && mediaType !== 'application/json') throw new Error(`Unable to encode data as ${mediaType}`);

      this.mediaType = mediaType ?? 'application/json';
      this.data = new Binary(JSON.stringify(data));
    }

    if (previous) this.previous = typeof previous == 'string' ? Binary.fromBase58(previous) : new Binary(previous);
  }

  static create() {
    return Object.create(this.prototype);
  }

  get hash(): Binary {
    return this._hash ?? new Binary(this.toBinary()).hash();
  }

  toBinary(): Uint8Array {
    if (typeof this.data == 'undefined') throw new Error('Event cannot be converted to binary: data unknown');
    if (!this.signKey) throw new Error('Event cannot be converted to binary: sign key not set');
    if (!this.previous) throw new Error('Event cannot be converted to binary: event is not part of an event chain');

    return concatBytes(
      this.previous,
      Uint8Array.from([keyTypeId(this.signKey.keyType)]),
      this.signKey.publicKey,
      convert.longToByteArray(this.timestamp),
      convert.stringToByteArrayWithSize(this.mediaType),
      this.data,
    );
  }

  verifySignature(): boolean {
    if (!this.signature || !this.signKey) throw new Error(`Event ${this._hash?.base58} is not signed`);

    return cypher(this.signKey).verifySignature(this.toBinary(), this.signature);
  }

  signWith(account: ISigner): this {
    if (!this.timestamp) this.timestamp = Date.now();

    try {
      this.signKey = {
        keyType: account.keyType,
        publicKey: Binary.fromBase58(account.publicKey),
      };

      this.signature = account.sign(this.toBinary());
      this._hash = this.hash;
    } catch (e) {
      throw new Error(`Failed to sign event. ${e.message || e}`);
    }

    return this;
  }

  addTo(chain: EventChain): this {
    chain.add(this);
    return this;
  }

  isSigned(): boolean {
    return !!this.signature;
  }

  get parsedData() {
    if (!this.mediaType.startsWith('application/json'))
      throw new Error(`Unable to parse data with media type "${this.mediaType}"`);

    return JSON.parse(this.data.toString());
  }

  toJSON(): IEventJSON {
    return {
      timestamp: this.timestamp,
      previous: this.previous?.base58,
      signKey: this.signKey ? { keyType: this.signKey.keyType, publicKey: this.signKey.publicKey.base58 } : undefined,
      signature: this.signature?.base58,
      hash: this.signKey ? this.hash.base58 : undefined,
      mediaType: this.mediaType,
      data: 'base64:' + this.data.base64,
    };
  }

  static from(data: IEventJSON): Event {
    const event = Event.create();

    try {
      event.timestamp = data.timestamp;
      if (data.previous) event.previous = Binary.fromBase58(data.previous);
      if (data.signKey) {
        event.signKey = {
          publicKey: Binary.fromBase58(data.signKey.publicKey),
          keyType: data.signKey.keyType,
        };
      }
      if (data.signature) event.signature = Binary.fromBase58(data.signature);
      if (data.hash) event._hash = Binary.fromBase58(data.hash);

      event.mediaType = data.mediaType;
      event.data =
        typeof data.data === 'string' && data.data.startsWith('base64:')
          ? Binary.fromBase64(data.data.slice(7))
          : new Binary(data.data);
    } catch (e) {
      throw new Error(`Unable to create event from JSON data: ${e.message || e}`);
    }

    return event;
  }
}
