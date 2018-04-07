import { IKeyPair } from '../../interfaces';

import base58 from '../libs/base58';
import crypto from '../utils/crypto';
import logger from '../utils/logger';

import config from '../config';

function encryptSeedPhrase(seedPhrase: string, password: string, encryptionRounds: number = 5000) {

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


export interface ISeed {
    readonly phrase: string;
    readonly address: string;
    readonly signKeys: IKeyPair;
    readonly encryptKeys: IKeyPair;
    encrypt(password: string, encryptionRounds?: number);
}


export class Seed implements ISeed {

    public readonly phrase: string;
    public readonly address: string;
    public readonly signKeys: IKeyPair;
    public readonly encryptKeys: IKeyPair;

    constructor(phrase: string, networkByte: string) {

        const keys = crypto.buildKeyPair(phrase, false, true);
        const curveKeys = crypto.buildKeyPair(phrase, true);

        this.phrase = phrase;
        this.address = crypto.buildRawAddress(curveKeys.publicKey, networkByte);
        this.signKeys = {
            privateKey: base58.encode(keys.privateKey),
            publicKey: base58.encode(keys.publicKey)
        };

        this.encryptKeys = {
          privateKey: base58.encode(curveKeys.privateKey),
          publicKey: base58.encode(curveKeys.publicKey)
        };

        Object.freeze(this);
        Object.freeze(this.signKeys);
        Object.freeze(this.encryptKeys);
    }

    public encrypt(password: string, encryptionRounds?: number) {
        return encryptSeedPhrase(this.phrase, password, encryptionRounds);
    }

}
