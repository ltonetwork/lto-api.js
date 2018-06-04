import base58 from '../libs/base58';
import crypto from '../utils/crypto';
import convert from '../utils/convert';

import { Account } from './Account';
import { EventChain } from './EventChain';

export class Event {

  /**
   * Base58 encoded JSON string with the body of the event.
   *
   */
  public body: string;

  /**
   * Time when the event was signed.
   *
   */
  public timestamp: number;

  /**
   * Hash to the previous event
   *
   */
  public previous: string;

  /**
   * URI of the public key used to sign the event
   *
   */
  public signkey: string;

  /**
   * Base58 encoded signature of the event
   *
   */
  public signature: string;

  /**
   * Base58 encoded SHA256 hash of the event
   *
   */
  public hash: string;

  constructor(body?: any, previous?: string) {
    if (body) {
      this.body = base58.encode(convert.stringToByteArray(JSON.stringify(body)));
    }
    this.previous = previous;
    this.timestamp = Date.now();
  }

  public getHash(): string {
    return base58.encode(crypto.sha256(this.getMessage()));
  }

  public getMessage(): string {

    if (!this.body) {
      throw new Error('Body unknown');
    }

    if (!this.signkey) {
      throw new Error('First set signkey before creating message');
    }

    return [
      this.body,
      this.timestamp,
      this.previous,
      this.signkey
      ].join('\n');
  }

  public verifySignature(): boolean {
    if(!this.signature || !this.signkey) {
      throw new Error('Signature and/or signkey not set');
    }

    return crypto.verifySignature(this.getMessage(), this.signature, this.signkey);
  }

  public getResourceVersion(): string {
    return base58.encode(crypto.sha256(this.body)).slice(0, 8);
  }

  public signWith(account: Account): Event {

    return account.signEvent(this);
  }

  public addTo(chain: EventChain): Event {

    return chain.addEvent(this);
  }
}