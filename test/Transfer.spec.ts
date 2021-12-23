import { assert } from 'chai';
import { Transfer } from '../src/classes/transactions/transfer'
import { concatUint8Arrays } from '../src/utils/concat';
import base58 from '../src/libs/base58';
import convert from '../src/utils/convert';
import crypto from "../src/utils/crypto";
import { LTO } from '../src/LTO';



const phrase = 'cool strike recall mother true topic road bright nature dilemma glide shift return mesh strategy';

describe('Transfer', () => {

    var account = new LTO('T').createAccountFromExistingPhrase(phrase);
    var recipient = '3NACnKFVN2DeFYjspHKfa2kvDqnPkhjGCD2';
    var amount: number = 100000000;
    var attachment: string = 'What a nice Transfer'

    describe('#toBinaryV3', () => {
        it('should return a binary tx V3', () => {
            let transaction = new Transfer(recipient, amount, attachment);
            assert.equal(base58.encode(transaction.toBinaryV3()),
                '66KPdiT5s3EUaULsJCZMcc6BYuVJT5G1z1YzLrGg6TgJdqT2p4yEvuA3L6jL1AedyAVDE8MaXgMhUXbyUBAKpp9yibmkjgQiF2LMhB')
        })
    })
});