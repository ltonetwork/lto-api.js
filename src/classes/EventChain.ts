import { Account } from './Account';
import secureRandom from '../libs/secure-random';
import crypto from '../utils/crypto';

export class EventChain {

  private readonly EVENT_CHAIN_VERSION = 0x40;

  public id: string;

  public events: Array<Event>;

  public init(account: Account): void {

    const prefix = Uint8Array.from([this.EVENT_CHAIN_VERSION]);

    const randomBytes = this.getNonce();

    this.id = crypto.buildEvenChainId(account.sign.publicKey, randomBytes);
  }

  protected getNonce() {
    return secureRandom.randomUint8Array(8);
  }

  public addEvent(event: Event): void {

  }
}