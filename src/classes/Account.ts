import { IKeyPairBytes } from '../../interfaces';
import { EventChain } from './EventChain';
import { Event } from './Event';
import { HTTPSignature } from './HTTPSignature';

import convert from '../utils/convert';
import crypto from '../utils/crypto';
import base58 from '../libs/base58';
import ed2curve from '../libs/ed2curve';
import encode from '../utils/encoder';

export class Account {

  /**
   * Seed phrase
   */
  public seed: string;

  /**
   * Signing keys
   */
  public sign: IKeyPairBytes;

  /**
   * Encryption keys
   */
  public encrypt: IKeyPairBytes;

  constructor(phrase?: string, networkByte?: string) {
    if (phrase) {
      const keys = crypto.buildNaclSignKeyPair(phrase);

      this.seed = phrase;
      this.sign = {
        privateKey: keys.privateKey,
        publicKey: keys.publicKey
      };

      this.encrypt = {
        privateKey: ed2curve.convertSecretKey(keys.privateKey),
        publicKey: ed2curve.convertSecretKey(keys.publicKey)
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

    event.signkey = this.getPublicSignKey();

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

    httpSign.signature = crypto.createSignature(requestBytes, this.getPrivateSignKey(), 'base64');
    httpSign.keyId = this.getPublicSignKey('base64');
    httpSign.algorithm = algorithm;

    return httpSign;
  }

  /**
   * Verify a signature with a message
   */
  public verify(signature: string, message: string, encoding = 'base58'): boolean {
    return crypto.verifySignature(message, signature, this.getPublicSignKey(), encoding);
  }

  /**
   * Create a signature from a message
   */
  public signMessage(message: string, encoding = 'base58'): string {
    const privateKey = this.getPrivateSignKey();
    return crypto.createSignature(message, this.getPrivateSignKey());
  }

  /**
   * Get public sign key in the given encoding
   */
  public getPublicSignKey(encoding = 'base58'): string {
    return encode.encode(this.sign.publicKey, encoding);
  }

  /**
   * Get private sign key in the given encoding
   */
  public getPrivateSignKey(encoding = 'base58'): string {
    return encode.encode(this.sign.privateKey, encoding);
  }

  /**
   * Get public encrypt key in the given encoding
   */
  public getPublicEncryptKey(encoding = 'base58'): string {
    return encode.encode(this.encrypt.publicKey, encoding);
  }

  /**
   * Get public encrypt key in the given encoding
   */
  public getPrivateEncryptKey(encoding = 'base58'): string {
    return encode.encode(this.encrypt.privateKey, encoding);
  }
}