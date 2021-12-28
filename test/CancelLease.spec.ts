import { assert } from 'chai';
import { CancelLease } from '../src/classes/transactions/cancelLease'
import base58 from '../src/libs/base58';
import { LTO } from '../src/LTO';



const phrase = 'cool strike recall mother true topic road bright nature dilemma glide shift return mesh strategy';

describe('CancelLease', () => {

    var account = new LTO('T').createAccountFromExistingPhrase(phrase);
    var leaseId:string = 'ELtXhrFTCRJSEweYAAaVTuv9wGjNzwHYUDnH6UT1JxmB';
    var transaction = new CancelLease(leaseId);


    describe('#toBinaryV3', () => {
        it('should return a binary tx V3', () => {
            assert.equal(base58.encode(transaction.toBinaryV3()),
                'VRf7LqgZrWysrzQ5gmhKMtZ69TTnt8A9aqUTmKYdiitjejbT7nQLgQPj54rnDMPkfkziZ')
        })
    })

    describe('#toBinaryV2', () => {
        it('should return a binary tx V2', () => {
            assert.equal(base58.encode(transaction.toBinaryV2()),
                '7SXPHH1p2st9WGkaRM2s9CgfZJT2bLWRQHNAT6HZ8zY8mupSSXmQs6o8NnQHHUKjTcB7')
        })
    })

    describe('#ToJson', () => {
        it('should return a transaction to Json', () => {
            let expected =  JSON.stringify({
                type: 9,
                version: 3,
                sender: '3N5PoiMisnbNPseVXcCa5WDRLLHkj7dz4Du',
                senderKeyType: 'ed25519',
                senderPublicKey: 'AneNBwCMTG1YQ5ShPErzJZETTsHEWFnPWhdkKiHG6VTX',
                fee: 500000000,
                timestamp: 1640352716317,
                proofs: [
                    '41u9WYiSfeMkzDLEqFufPt5hhXvnmPVr4qqsmGuicHZxTrphtsrbcG3h4zigbaFAkgKLKA9v4ZQR9dAjvQdkmJiE'
                ],
                leaseId: 'ELtXhrFTCRJSEweYAAaVTuv9wGjNzwHYUDnH6UT1JxmB'
            })
            transaction.timestamp = 1640352716317
            transaction.signWith(account)
            assert.equal(JSON.stringify(transaction.toJson()), expected);
        })
    })

    describe('#FromData', () => {
        it('should return a transaction from the data', () => {
            let expected = {
                txFee: 500000000,
                timestamp: 1640352716317,
                proofs: [
                    '41u9WYiSfeMkzDLEqFufPt5hhXvnmPVr4qqsmGuicHZxTrphtsrbcG3h4zigbaFAkgKLKA9v4ZQR9dAjvQdkmJiE'
                ],
                sender: '3N5PoiMisnbNPseVXcCa5WDRLLHkj7dz4Du',
                senderPublicKey: 'AneNBwCMTG1YQ5ShPErzJZETTsHEWFnPWhdkKiHG6VTX',
                chainId: '',
                sponsor: '',
                sponsorPublicKey: '',
                senderKeyType: 'ed25519',
                sponsorKeyType: 'ed25519',
                leaseId: 'ELtXhrFTCRJSEweYAAaVTuv9wGjNzwHYUDnH6UT1JxmB',
                type: 9,
                version: 3,
                id: 'Ba6eaVVLyDr4K3fJzM1BTsy3zC87UYjsNVpTBHRLVskp',
                height: ''
                }
            let transaction = new CancelLease(expected['recipient']);
            let actual = transaction.fromData(expected)
            assert.equal(JSON.stringify(expected), JSON.stringify(actual))
        })
    })
});