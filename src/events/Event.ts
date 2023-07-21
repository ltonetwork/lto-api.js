import * as convert from '../utils/convert';

import { IBinary, IEventJSON, ISigner, TKeyType } from '../types';
import EventChain, { EVENT_CHAIN_V1, EVENT_CHAIN_V2 } from './EventChain';
import Binary from '../Binary';
import { concatBytes } from '@noble/hashes/utils';
import { keyTypeId } from '../utils/crypto';
import { cypher } from '../accounts';

export default class Event {
  private version = EVENT_CHAIN_V2;

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

  /** Hash of attachments related to the event */
  readonly attachments: Array<{ name: string; mediaType: string; data: IBinary }> = [];

  constructor(data: any, mediaType?: string, previous?: string | Uint8Array) {
    this._setData(data, mediaType);
    if (previous) this.previous = typeof previous == 'string' ? Binary.fromBase58(previous) : new Binary(previous);
  }

  addAttachment(name: string, data: any, mediaType?: string) {
    this.attachments.push(this._setData(data, mediaType, { name }));
  }

  private _setData<T extends { mediaType?: string; data?: IBinary; [_: string]: any }>(
    data: any,
    mediaType?: string,
    target: T = this as any,
  ): { mediaType: string; data: IBinary } & T {
    if (data instanceof Uint8Array) {
      target.mediaType = mediaType ?? 'application/octet-stream';
      target.data = data instanceof Binary ? data : new Binary(data);
    } else {
      if (mediaType && mediaType !== 'application/json') throw new Error(`Unable to encode data as ${mediaType}`);

      target.mediaType = mediaType ?? 'application/json';
      target.data = new Binary(JSON.stringify(data));
    }

    return target as { mediaType: string; data: IBinary } & T;
  }

  get hash(): Binary {
    return this._hash ?? new Binary(this.toBinary()).hash();
  }

  toBinary(): Uint8Array {
    if (typeof this.data == 'undefined') throw new Error('Event cannot be converted to binary: data unknown');
    if (!this.signKey) throw new Error('Event cannot be converted to binary: sign key not set');
    if (!this.previous) throw new Error('Event cannot be converted to binary: event is not part of an event chain');

    switch (this.version) {
      case EVENT_CHAIN_V1:
        return this.toBinaryV1();
      case EVENT_CHAIN_V2:
        return this.toBinaryV2();
      default:
        throw new Error(`Event cannot be converted to binary: version ${this.version} not supported`);
    }
  }

  private toBinaryV1(): Uint8Array {
    return concatBytes(
      this.previous,
      Uint8Array.from([keyTypeId(this.signKey.keyType)]),
      this.signKey.publicKey,
      convert.longToByteArray(this.timestamp),
      convert.stringToByteArray(this.mediaType),
      this.data,
    );
  }

  private toBinaryV2(): Uint8Array {
    return concatBytes(
      this.previous,
      Uint8Array.from([keyTypeId(this.signKey.keyType)]),
      this.signKey.publicKey,
      convert.longToByteArray(this.timestamp),
      convert.stringToByteArrayWithSize(this.mediaType),
      convert.bytesToByteArrayWithSize(this.data),
      convert.shortToByteArray(this.attachments.length),
      ...this.attachments.map((a) => {
        return concatBytes(
          convert.stringToByteArrayWithSize(a.name),
          convert.stringToByteArrayWithSize(a.mediaType),
          convert.bytesToByteArrayWithSize(a.data),
        );
      }),
    );
  }

  verifySignature(): boolean {
    if (!this.signature || !this.signKey) throw new Error(`Event ${this._hash?.base58} is not signed`);

    return cypher(this.signKey).verifySignature(this.toBinary(), this.signature);
  }

  verifyHash(): boolean {
    return !this._hash || this._hash.hex === new Binary(this.toBinary()).hash().hex;
  }

  signWith(account: ISigner): this {
    if (!this.timestamp) this.timestamp = Date.now();

    try {
      this.signKey = {
        keyType: account.keyType,
        publicKey: Binary.fromBase58(account.publicKey),
      };

      const binary = this.toBinary();
      this.signature = account.sign(binary);
      this._hash = new Binary(binary).hash();
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
      attachments: this.attachments.map((attachment) => ({
        name: attachment.name,
        mediaType: attachment.mediaType,
        data: 'base64:' + attachment.data.base64,
      })),
    };
  }

  static from(data: IEventJSON, version = 2): Event {
    const event = Object.create(this.prototype);
    event.version = version;

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

      event.attachments = (data.attachments ?? []).map((attachment) => ({
        name: attachment.name,
        mediaType: attachment.mediaType,
        data:
          typeof attachment.data === 'string' && attachment.data.startsWith('base64:')
            ? Binary.fromBase64(attachment.data.slice(7))
            : new Binary(attachment.data),
      }));
    } catch (e) {
      throw new Error(`Unable to create event from JSON data: ${e.message || e}`);
    }

    return event;
  }
}
