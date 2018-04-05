import { ISeed, Seed } from './classes/Seed';
import { IEvent, ISignature } from '../interfaces';

import config from './config';

import crypto from './utils/crypto';
import logger from './utils/logger';
import convert from './utils/convert';
import secureRandom from './libs/secure-random';
import dictionary from './seedDictionary';
import base58 from './libs/base58';
import * as constants from './constants';

function generateNewSeed(length): string {

  const random = crypto.generateRandomUint32Array(length);
  const wordCount = dictionary.length;
  const phrase = [];

  for (let i = 0; i < length; i++) {
    const wordIndex = random[i] % wordCount;
    phrase.push(dictionary[wordIndex]);
  }

  random.set(new Uint8Array(random.length));

  return phrase.join(' ');
}

export { convert, base58, constants };

export class LTO {

  public readonly networkByte: string;

  constructor(networkByte: string) {
    this.networkByte = networkByte;
  }

  public createSeed(words: number = 15): ISeed {

    const phrase = generateNewSeed(words);
    const minimumSeedLength = config.getMinimumSeedLength();

    if (phrase.length < minimumSeedLength) {
      // If you see that error you should increase the number of words in the generated seed
      throw new Error(`The resulted seed length is less than the minimum length (${minimumSeedLength})`);
    }

    return new Seed(phrase, this.networkByte);
  }

  public seedFromExistingPhrase(phrase: string): ISeed {

    if (phrase.length < config.getMinimumSeedLength()) {
      throw new Error('Your seed length is less than allowed in config');
    }

    return new Seed(phrase, this.networkByte);

  }

  public encryptSeedPhrase(seedPhrase: string, password: string, encryptionRounds: number = 5000): string {

    if (password && password.length < 8) {
      logger.warn('Your password may be too weak');
    }

    if (encryptionRounds < 1000) {
      logger.warn('Encryption rounds may be too few');
    }

    if (seedPhrase.length < config.getMinimumSeedLength()) {
      throw new Error('The seed phrase you are trying to encrypt is too short');
    }

    return crypto.encryptSeed(seedPhrase, password, encryptionRounds);

  }

  public decryptSeedPhrase(encryptedSeedPhrase: string, password: string, encryptionRounds: number = 5000): string {

    const wrongPasswordMessage = 'The password is wrong';

    let phrase;

    try {
      phrase = crypto.decryptSeed(encryptedSeedPhrase, password, encryptionRounds);
    } catch (e) {
      throw new Error(wrongPasswordMessage);
    }

    if (phrase === '' || phrase.length < config.getMinimumSeedLength()) {
      throw new Error(wrongPasswordMessage);
    }

    return phrase;

  }

  public signEvent(event: IEvent, privateKey: string): string {
    const eventBytes = this.getEventBytes(event);

    let randomBytes;

    return crypto.createSignature(eventBytes, privateKey, randomBytes);
  }

  public hashEvent(event: IEvent): string {
    const eventBytes = this.getEventBytes(event);
    return crypto.buildHash(eventBytes);
  }

  public verifyEvent(event: IEvent, signature: string, publicKey: string): boolean {
    const eventBytes = this.getEventBytes(event);
    return crypto.verifySignature(eventBytes, signature, publicKey);
  }

  public createEventId(publicKey: string): string {
    const nonce = this.getNonce();
    return crypto.buildEventId(publicKey, nonce);
  }

  public verifyEventId(transactionId: string, publicKey?: string): boolean {
    return crypto.verifyEventId(transactionId, publicKey);
  }

  public hashEventId(eventId: string): string {
    const eventIdBytes = base58.decode(eventId);
    return crypto.buildHash(eventIdBytes);
  }

  public createDigest(body: string): string {
    return crypto.buildHash(body, 'base64');
  }

  public signRequest(requestHeaders: any, publicKey: string, privateKey: string, sha256=true): string {
    const headers = Object.keys(requestHeaders).join(' ');
    const message = Object.entries(requestHeaders)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');

    let algorithm = 'ed25519';
    let requestBytes = Uint8Array.from(convert.stringToByteArray(message));
    if (sha256) {
      requestBytes = crypto.sha256(requestBytes);
      algorithm = 'ed25519-sha256';
    }

    const signature = crypto.createSignature(requestBytes, privateKey, 'base64');

    return `keyId=\"${publicKey}\",algorithm="${algorithm}",headers=\"${headers}\",signature="${signature}"`;
  }

  public verifyRequest(requestHeaders: any, publicKey: string): boolean {
    const signature: ISignature = this.signatureParser(requestHeaders.signature);
    const headers = signature.headers.split(' ');

    const message = headers
      .map(header => `${header}: ${requestHeaders[header]}`)
      .join('\n');

    let requestBytes = Uint8Array.from(convert.stringToByteArray(message));
    if (signature.algorithm == 'ed25519-sha256') {
      requestBytes = crypto.sha256(requestBytes);
    }

    return crypto.verifySignature(requestBytes, signature.signature, signature.keyId, 'base64');
  }

  protected signatureParser (signature: string): ISignature {
    const SIGNATURE = new RegExp(/(\w+)="([^"]*)",*/g);
    const result: any = {};

    signature.replace(SIGNATURE, (match, key, value) => result[key] = value);

    return result;
  }

  protected getNonce(): Uint8Array {
    return secureRandom.randomUint8Array(8);
  }

  protected getEventBytes(event: IEvent): Uint8Array {
    const eventString = event.body + '\n' +
                        event.timestamp + '\n' +
                        event.previous + '\n' +
                        event.signkey;

    return Uint8Array.from(convert.stringToByteArray(eventString));
  }
}