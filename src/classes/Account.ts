import { IKeyPair } from '../../interfaces';
import { EventChain } from './EventChain';
import { Event } from './Event';
import { HTTPSignature } from './HTTPSignature';

import convert from '../utils/convert';
import crypto from '../utils/crypto';
import base58 from '../libs/base58';


export class Account {

  /**
   * Seed phrase
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

  constructor(phrase?: string, networkByte?: string) {
    if (phrase) {
      const keys = crypto.buildNaclSignKeyPair(phrase);
      const curveKeys = crypto.buildBoxKeyPair(phrase);

      this.seed = phrase;
      this.sign = {
        privateKey: base58.encode(keys.privateKey),
        publicKey: base58.encode(keys.publicKey)
      };

      this.encrypt = {
        privateKey: base58.encode(curveKeys.privateKey),
        publicKey: base58.encode(curveKeys.publicKey)
      };
    }
  }

  /**
   * Create an event chain
   */
  public createEventChain(nonce?: string): EventChain {

    const eventChain = new EventChain();
    eventChain.init(this, nonce);

    return eventChain;
  }

  /**
   * Encrypt the seed phrase with a password
   */
  public encryptSeed(password: string, encryptionRounds = 5000): string {

    return crypto.encryptSeed(this.seed, password, encryptionRounds);
  }

  /**
   * Add a signature to the event
   */
  public signEvent(event: Event): Event {

    event.signkey = this.sign.publicKey;

    const message = event.getMessage();
    event.signature = this.signMessage(message);
    event.hash = event.getHash();
    return event;
  }

  /**
   * Add a signature to the http request
   */
  public signHTTPSignature(httpSign: HTTPSignature, algorithm = 'ed25519-sha256'): HTTPSignature {
    const message = httpSign.getMessage();

    let requestBytes: Uint8Array = Uint8Array.from(convert.stringToByteArray(message));
    switch(algorithm) {
      case 'ed25519':
        break;

      case 'ed25519-sha256':
        requestBytes = crypto.sha256(requestBytes);
        break;

      default:
        throw new Error(`Unsupported algorithm: ${httpSign.algorithm}`);
    }

    httpSign.signature = crypto.createSignature(requestBytes, this.sign.privateKey, 'base64');
    httpSign.keyId = this.sign.publicKey;
    httpSign.algorithm = algorithm;

    return httpSign;
  }

  /**
   * Verify a signature with a message
   */
  public verify(signature: string, message: string, encoding = 'base58'): boolean {
    return crypto.verifySignature(message, signature, this.sign.publicKey, encoding);
  }

  /**
   * Create a signature from a message
   */
  public signMessage(message: string, encoding = 'base58'): string {
    return crypto.createSignature(message, this.sign.privateKey);
  }
}