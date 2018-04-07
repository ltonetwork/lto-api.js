import { IKeyPair } from '../../interfaces';
import { EventChain } from './EventChain';
import crypto from '../utils/crypto';
import base58 from '../libs/base58';

export class Account {

  /**
   * Seed
   */
  public seed: string;

  /**
   * Signing keys
   */
  public sign: IKeyPair;

  /**
   * Encryption keys
   */
  public encrypt: IKeyPair;

  constructor(phrase: string, networkByte: string) {
    const keys = crypto.buildKeyPair(phrase, false, true);
    const curveKeys = crypto.buildKeyPair(phrase, true);

    this.seed = phrase;
    //this.address = crypto.buildRawAddress(curveKeys.publicKey, networkByte);
    this.sign = {
      privateKey: base58.encode(keys.privateKey),
      publicKey: base58.encode(keys.publicKey)
    };

    this.encrypt = {
      privateKey: base58.encode(curveKeys.privateKey),
      publicKey: base58.encode(curveKeys.publicKey)
    };
  }

  /**
   * Create an event chain
   */
  public createEventChain(): EventChain {

    const eventChain = new EventChain();
    eventChain.init(this);

    return eventChain;
  }

  public encryptSeed(password: string): string {

  }

  public signEvent(): string {
    return null;
  }

  public verify(): boolean {
    return null;
  }
}