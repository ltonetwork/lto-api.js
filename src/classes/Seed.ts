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
    readonly keyPair: IKeyPair;
    encrypt(password: string, encryptionRounds?: number);
}


export class Seed implements ISeed {

    public readonly phrase: string;
    public readonly address: string;
    public readonly keyPair: IKeyPair;

    constructor(phrase: string) {

        const keys = crypto.buildKeyPair(phrase);

        this.phrase = phrase;
        //this.address = crypto.buildRawAddress(keys.publicKey);
        this.keyPair = {
            privateKey: base58.encode(keys.privateKey),
            publicKey: base58.encode(keys.publicKey)
        };

        Object.freeze(this);
        Object.freeze(this.keyPair);

    }

    public encrypt(password: string, encryptionRounds?: number) {
        return encryptSeedPhrase(this.phrase, password, encryptionRounds);
    }

}
