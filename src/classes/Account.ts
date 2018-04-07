import { IKeyPair } from '../../interfaces';
import { EventChain } from './EventChain';

export class Account {

  /**
   * Signing keys
   */
  public sign: IKeyPair;

  /**
   * Encryption keys
   */
  public encrypt: IKeyPair;

  /**
   * Create an event chain
   */
  public createEventChain(): EventChain {
    return null;
  }

  public signEvent(): string {
    return null;
  }

  public verify(): boolean {
    return null;
  }
}