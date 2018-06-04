import { Account } from './Account';
import { Event } from './Event';
import secureRandom from '../libs/secure-random';
import crypto from '../utils/crypto';
import base58 from '../libs/base58';

export class EventChain {

  private readonly EVENT_CHAIN_VERSION = 0x40;

  public id: string;
  public events: Array<Event> = [];

  constructor(id?: string, ) {
    this.id = id;
  }

  public init(account: Account, nonce?: string): void {

    const prefix = Uint8Array.from([this.EVENT_CHAIN_VERSION]);

    const nonceBytes = nonce ? this.createNonce(nonce) : this.getRandomNonce();

    this.id = crypto.buildEvenChainId(account.getPublicSignKey(), nonceBytes);
  }

  public addEvent(event: Event): Event {
    event.previous = this.getLatestHash();

    this.events.push(event);
    return event;
  }

  public getLatestHash(): string {
    if(this.events.length == 0) {
      return crypto.buildHash(base58.decode(this.id));
    }

    const event = this.events.slice(-1)[0];
    return event.getHash();
  }

  protected createNonce(input?: string): Uint8Array {
    return Uint8Array.from(crypto.sha256(input).slice(0, 20));
  }

  protected getRandomNonce(): Uint8Array {
    return secureRandom.randomUint8Array(20);
  }
}