import { assert } from 'chai';
import { CancelSponsorship } from '../src/transactions/cancelSponsorship'
import base58 from '../src/libs/base58';
import { AccountFactoryED25519 } from '../src/accounts/ed25519/AccountFactoryED25519';



const phrase = 'cool strike recall mother true topic road bright nature dilemma glide shift return mesh strategy';

describe('CancelSponsorship', () => {

    var account = new AccountFactoryED25519('T').createFromSeed(phrase);
    var recipient = '3NACnKFVN2DeFYjspHKfa2kvDqnPkhjGCD2';
    var transaction = new CancelSponsorship(recipient);


    describe('#toBinaryV3', () => {
        it('should return a binary tx V3', () => {
            assert.equal(base58.encode(transaction.toBinaryV3()),
                'UHSjCZSBYgt7tkZ9yWAM4aZoZ4WMz9XDhxtLoG9tcc6ddDNb3tq1h5zwQWeDS')
        })
    })

    describe('#toBinaryV1', () => {
        it('should return a binary tx V1', () => {
            assert.equal(base58.encode(transaction.toBinaryV1()),
                '7BXKZ4dL11zqYNeeuF3n1FkGHAaLJhZ7ZpFr13VEHKSgNt7tfgabXYcK9RH1')
        })
    })

    describe('#ToJson', () => {
        it('should return a transaction to Json', () => {
            let expected =  JSON.stringify({
                id: "",
                type: 19,
                version: 3,
                sender: '3N5PoiMisnbNPseVXcCa5WDRLLHkj7dz4Du',
                senderKeyType: 'ed25519',
                senderPublicKey: 'AneNBwCMTG1YQ5ShPErzJZETTsHEWFnPWhdkKiHG6VTX',
                recipient: '3NACnKFVN2DeFYjspHKfa2kvDqnPkhjGCD2',
                timestamp: 1640353616132,
                fee: 500000000,
                proofs: [
                    '4gShmspKQbBARBePwazAhdJcjxoduQ1LHjUBRqudBvys7nFRcSx9gQem1wDxKNzCoxgfH52kKYpdUEQ3uhmGDvi2'
                ],
                height: ""
            })
            transaction.timestamp = 1640353616132
            transaction.signWith(account)
            assert.equal(JSON.stringify(transaction.toJson()), expected);
        })
    })

    describe('#FromData', () => {
        it('should return a transaction from the data', () => {
            let expected = {
                txFee: 500000000,
                timestamp: 1640353616132,
                proofs: [
                    '4gShmspKQbBARBePwazAhdJcjxoduQ1LHjUBRqudBvys7nFRcSx9gQem1wDxKNzCoxgfH52kKYpdUEQ3uhmGDvi2'
                ],
                sender: '3N5PoiMisnbNPseVXcCa5WDRLLHkj7dz4Du',
                senderPublicKey: 'AneNBwCMTG1YQ5ShPErzJZETTsHEWFnPWhdkKiHG6VTX',
                chainId: '',
                sponsor: '',
                sponsorPublicKey: '',
                senderKeyType: 'ed25519',
                sponsorKeyType: 'ed25519',
                recipient: '3NACnKFVN2DeFYjspHKfa2kvDqnPkhjGCD2',
                type: 19,
                version: 3,
                id: 'CNL2huqRzjbqV7dCrHUs8ZCb4CHWv6pPN1vt1TvcA9Ki',
                height: ''
            }
            let transaction = new CancelSponsorship(expected['recipient']);
            let actual = transaction.fromData(expected)
            assert.equal(JSON.stringify(expected), JSON.stringify(actual))
        })
    })
});
