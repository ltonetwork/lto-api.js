import { Account } from './classes/Account';
import { Event } from './classes/Event';
import { EventChain } from './classes/EventChain';
import { HTTPSignature } from './classes/HTTPSignature';

import config from './config';

import ed2curve from './libs/ed2curve';
import crypto from './utils/crypto';
import logger from './utils/logger';
import dictionary from './seedDictionary';
import {IKeyPairBytes} from "../interfaces";

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

export { Account, Event, EventChain, HTTPSignature};

export class LTO {

  public readonly networkByte: string;

  constructor(networkByte = 'W') {
    this.networkByte = networkByte;
  }

  /**
   * Creates an account based on a random seed
   */
  public createAccount(words: number = 15) {
    const phrase = generateNewSeed(words);

    if (phrase.length < config.getMinimumSeedLength()) {
      throw new Error('Your seed length is less than allowed in config');
    }

    return new Account(phrase, this.networkByte);
  }

  /**
   * Creates an account based on an existing seed
   */
  public createAccountFromExistingPhrase(phrase: string): Account {

    if (phrase.length < config.getMinimumSeedLength()) {
      throw new Error('Your seed length is less than allowed in config');
    }

    const account = new Account(null, this.networkByte);
    account.seed = phrase;
    account.sign = this.createSignKeyPairFromSeed(phrase);
    account.encrypt = this.convertSignToEcnryptKeys(account.sign);

    return account;
  }

  /**
   * Creates an account based on a private key
   */
  public createAccountFromPrivateKey(privateKey: string): Account {

    const account = new Account(null, this.networkByte);
    account.sign = this.createSignKeyPairFromSecret(privateKey);
    account.encrypt = this.convertSignToEcnryptKeys(account.sign);

    return account;
  }

  /**
   * Encrypt seed phrase
   */
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

  /**
   * Decrypt seed phrase
   */
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

  /**
   * Create an event chain id based on a public sign key
   *
   * @param publicSignKey {string} - Public sign on which the event chain will be based
   * @param nonce {string} - (optional) A random nonce will generate by default
   */
  public createEventChainId(publicSignKey: string, nonce?: string): string {

    const account = new Account();
    account.setPublicSignKey(publicSignKey);

    return account.createEventChain(nonce).id;
  }

  protected createSignKeyPairFromSecret(privatekey: string): IKeyPairBytes {
    return crypto.buildNaclSignKeyPairFromSecret(privatekey);
  }

  protected createSignKeyPairFromSeed(seed: string): IKeyPairBytes {
    const keys = crypto.buildNaclSignKeyPair(seed);

    return {
      privateKey: keys.privateKey,
      publicKey: keys.publicKey
    };
  }

  protected convertSignToEcnryptKeys(signKeys: IKeyPairBytes): IKeyPairBytes {
    return {
      privateKey: ed2curve.convertSecretKey(signKeys.privateKey),
      publicKey: ed2curve.convertSecretKey(signKeys.publicKey)
    }
  }
}