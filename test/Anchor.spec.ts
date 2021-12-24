import { assert } from 'chai';
import { Anchor } from '../src/classes/transactions/anchor'
import base58 from '../src/libs/base58';
import { LTO } from '../src/LTO';



const phrase = 'cool strike recall mother true topic road bright nature dilemma glide shift return mesh strategy';

describe('Anchor', () => {

    var account = new LTO('T').createAccountFromExistingPhrase(phrase);
    var anchor:string = '7ab62201df228f2c92ec74c29c61889b9658f4eef6a9a4a51bd25f23c9fcf376'
    var transaction = new Anchor(anchor);


    describe('#toBinaryV3', () => {
        it('should return a binary tx V3', () => {
            assert.equal(base58.encode(transaction.toBinaryV3()),
                '2b3WfgxbrRL7x6dETZSDUrFtP8siMbYKE93XXHfSazxu3xatdBFo4jT6K3B8uktBrTvNW4DJCsNMBz6ed15u1ULna3UV4HvN4QvssTDtHhuUFi3B75aALA9')
        })
    })

    describe('#toBinaryV1', () => {
        it('should return a binary tx V2', () => {
            assert.equal(base58.encode(transaction.toBinaryV1()),
                'MrWNvVUu4BHGsfSfu2tc5FHirD7MUvQJcw7DxGSuVqPKSHtAKyi5hNunPoicVQztnnsBdUm1fqpZnqfsUkL7gomCwPyS1aKixKhHuvStDwprhdX2VWuTd')
        })
    })

    describe('#ToJson', () => {
        it('should return a transaction to Json', () => {
            let expected =  JSON.stringify({
                type: 15,
                version: 3,
                sender: '3N5PoiMisnbNPseVXcCa5WDRLLHkj7dz4Du',
                senderKeyType: 'ed25519',
                senderPublicKey: 'AneNBwCMTG1YQ5ShPErzJZETTsHEWFnPWhdkKiHG6VTX',
                fee: 35000000,
                timestamp: 1640340218505,
                anchors: [
                  '27DjBot2tGXZT7SCuu9fyEu7pNrXbaeXWUeuYB21D6jCENWeEH1G6hV4BR97YXx7ZPaUHELCGeuLAFA3Ruo2gZkH'
                ],
                proofs: [
                  '4325PApLZkChBPnUufUdDRFkrgJ2VULPRxwoeoociGz4YGtrStd6pCvkE1ZZdeH88ZUdip7XQU9YgMiNxNDTbaYg'
                ]
            })
            transaction.timestamp = 1640340218505
            transaction.signWith(account)
            assert.equal(JSON.stringify(transaction.toJson()), expected);
        })
    })

    describe('#FromData', () => {
        it('should return a transaction from the data', () => {
            let expected =  {
                txFee: 35000000,
                timestamp: 1640341125640,
                proofs: [
                  '2E55111TcfD7nAPvCwk1TvpGXHAdHoHxqL17D9MkLaB8t83XqDGPhXCwNfZ6zGrRmGZoNevt8Rf5C2aHBuv97YK1'
                ],
                sender: '3N5PoiMisnbNPseVXcCa5WDRLLHkj7dz4Du',
                senderPublicKey: 'AneNBwCMTG1YQ5ShPErzJZETTsHEWFnPWhdkKiHG6VTX',
                chainId: '',
                sponsor: '',
                sponsorPublicKey: '',
                senderKeyType: 'ed25519',
                sponsorKeyType: 'ed25519',
                anchor: [
                  '27DjBot2tGXZT7SCuu9fyEu7pNrXbaeXWUeuYB21D6jCENWeEH1G6hV4BR97YXx7ZPaUHELCGeuLAFA3Ruo2gZkH'
                ],
                type: 15,
                version: 3,
                id: 'DgCGGoofcEoQj5pV45SgEBq77ymkGkKkHPc522YAmGMn',
                height: ''
            }
            let transaction = new Anchor(expected['anchor']);
            let actual = transaction.fromData(expected)
            assert.equal(JSON.stringify(expected), JSON.stringify(actual))
        })
    })
});