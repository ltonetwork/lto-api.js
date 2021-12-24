import { assert } from 'chai';
import { Lease } from '../src/classes/transactions/lease'
import base58 from '../src/libs/base58';
import { LTO } from '../src/LTO';



const phrase = 'cool strike recall mother true topic road bright nature dilemma glide shift return mesh strategy';

describe('Lease', () => {

    var account = new LTO('T').createAccountFromExistingPhrase(phrase);
    var recipient = '3NACnKFVN2DeFYjspHKfa2kvDqnPkhjGCD2';
    var amount: number = 100000000;
    var transaction = new Lease(recipient, amount);


    describe('#toBinaryV3', () => {
        it('should return a binary tx V3', () => {
            assert.equal(base58.encode(transaction.toBinaryV3()),
                '9VKMWzTt2fCiGKYLpLNapvLthTJ5Rk854yVcP3C775hQ3WgxTN35s9buj5Q68bQNncMhXUKq')
        })
    })

    describe('#toBinaryV2', () => {
        it('should return a binary tx V2', () => {
            assert.equal(base58.encode(transaction.toBinaryV2()),
                '9VKMXwetSw8QvSNVsnEVQcgRfrVSeFUdanpNGiiS8zkc1F5hxh8tcYd3keAd6jGZyYJwqB2X')
        })
    })

    describe('#ToJson', () => {
        it('should return a transaction to Json', () => {
            let expected =  JSON.stringify({
                type: 8,
                version: 3,
                sender: '3N5PoiMisnbNPseVXcCa5WDRLLHkj7dz4Du',
                senderKeyType: 'ed25519',
                senderPublicKey: 'AneNBwCMTG1YQ5ShPErzJZETTsHEWFnPWhdkKiHG6VTX',
                fee: 100000000,
                timestamp: 1640341125640,
                amount: 100000000,
                recipient: '3NACnKFVN2DeFYjspHKfa2kvDqnPkhjGCD2',
                proofs: [
                  '484nSbEWvsbRV9BMLTeMrBML7j7U4nRbVBv6dvcxERBUwHXTzWXg4tGEmU8CjxLuCYosBULDj9knroXHj3Jmht4E'
                ]
              })
            transaction.timestamp = 1640341125640
            transaction.signWith(account)
            assert.equal(JSON.stringify(transaction.toJson()), expected);
        })
    })

    describe('#FromData', () => {
        it('should return a transaction from the data', () => {
            let expected = {
                txFee: 100000000,
                timestamp: 1640341125640,
                proofs: [
                  '484nSbEWvsbRV9BMLTeMrBML7j7U4nRbVBv6dvcxERBUwHXTzWXg4tGEmU8CjxLuCYosBULDj9knroXHj3Jmht4E'
                ],
                sender: '3N5PoiMisnbNPseVXcCa5WDRLLHkj7dz4Du',
                senderPublicKey: 'AneNBwCMTG1YQ5ShPErzJZETTsHEWFnPWhdkKiHG6VTX',
                chainId: '',
                sponsor: '',
                sponsorPublicKey: '',
                senderKeyType: 'ed25519',
                sponsorKeyType: 'ed25519',
                recipient: '3NACnKFVN2DeFYjspHKfa2kvDqnPkhjGCD2',
                amount: 100000000,
                type: 8,
                version: 3,
                id: 'ELtXhrFTCRJSEweYAAaVTuv9wGjNzwHYUDnH6UT1JxmB',
                height: ''
            }
            let transaction = new Lease(expected['recipient'], expected['amount']);
            let actual = transaction.fromData(expected)
            assert.equal(JSON.stringify(expected), JSON.stringify(actual))
        })
    })
});