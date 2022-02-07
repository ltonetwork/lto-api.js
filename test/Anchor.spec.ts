import { assert } from 'chai';
import { Anchor } from '../src/transactions/anchor'
import base58 from '../src/libs/base58';
import { AccountFactoryED25519 } from '../src/classes/AccountFactories/AccountFactoryED25519';



const phrase = 'cool strike recall mother true topic road bright nature dilemma glide shift return mesh strategy';
const phrase2  = 'cage afford gym kitchen price physical grid impulse tumble uncover deliver bounce dance display vintage'

describe('Anchor', () => {

    var account = new AccountFactoryED25519('T').createFromSeed(phrase);
    var account2 = new AccountFactoryED25519('T').createFromSeed(phrase2);
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

    describe('#isSigned', () => {
        it('should return false', () => {
            let transaction = new Anchor(anchor);
            assert.isFalse(transaction.isSigned());
            transaction.signWith(account);
            assert.isTrue(transaction.isSigned())
        })
    })

    describe('#ToJsonSponsor', () => {
        it('should return a transaction to Json with the sponsor data', () => {
            let expected = JSON.stringify({
                type: 15,
                version: 3,
                sender: '3N5PoiMisnbNPseVXcCa5WDRLLHkj7dz4Du',
                senderKeyType: 'ed25519',
                senderPublicKey: 'AneNBwCMTG1YQ5ShPErzJZETTsHEWFnPWhdkKiHG6VTX',
                fee: 35000000,
                timestamp: 1640353616132,
                anchors: [
                    '27DjBot2tGXZT7SCuu9fyEu7pNrXbaeXWUeuYB21D6jCENWeEH1G6hV4BR97YXx7ZPaUHELCGeuLAFA3Ruo2gZkH'
                ],
                proofs: [
                    'Y2TNZPvXrhXRJCpLJVgJ1RaMh32dmz4ste7STK2TkZo3mx4QzLWMhLvyyg4576kL84FsiPs5fJA9JeEdSDkmtGa',
                    '3s1SNNY3wXRfxDs26E3uQSsRsnkESG1pzfXXoQAJ3E3yF6vka5HjVgsTzPJG9j6DckyzKhcq2FhXuDvdFYJ2G4g1'
                ],
                sponsor: '3NACnKFVN2DeFYjspHKfa2kvDqnPkhjGCD2',
                sponsorPublicKey: 'DriAcwPisEqtNcug2JJ2SSSDLgcrEecvmmgZgo9VZBog',
                sponsorKeyType: 'ed25519'
            })
            let transaction = new Anchor(anchor);
            transaction.timestamp = 1640353616132;
            transaction.signWith(account);
            transaction.sponsorWith(account2);
            assert.equal(JSON.stringify(transaction.toJson()), expected);
        })
    })

    describe('#FromData', () => {
        it('should return a transaction from the data with the sponsore informations', () => {
            let expected = {
                txFee: 35000000,
                timestamp: 1640353616132,
                proofs: [
                    'Y2TNZPvXrhXRJCpLJVgJ1RaMh32dmz4ste7STK2TkZo3mx4QzLWMhLvyyg4576kL84FsiPs5fJA9JeEdSDkmtGa',
                    '3s1SNNY3wXRfxDs26E3uQSsRsnkESG1pzfXXoQAJ3E3yF6vka5HjVgsTzPJG9j6DckyzKhcq2FhXuDvdFYJ2G4g1'
                ],
                sender: '3N5PoiMisnbNPseVXcCa5WDRLLHkj7dz4Du',
                senderPublicKey: 'AneNBwCMTG1YQ5ShPErzJZETTsHEWFnPWhdkKiHG6VTX',
                chainId: '',
                sponsor: '3NACnKFVN2DeFYjspHKfa2kvDqnPkhjGCD2',
                sponsorPublicKey: 'DriAcwPisEqtNcug2JJ2SSSDLgcrEecvmmgZgo9VZBog',
                senderKeyType: 'ed25519',
                sponsorKeyType: 'ed25519',
                anchor: undefined,
                type: 15,
                version: 3,
                id: 'kyjA9pK4qPzG79epwRPY7wfUM6vqvCJxopHgR31RFP9',
                height: ''
            }
            let transaction = new Anchor(expected['anchor']);
            let actual = transaction.fromData(expected)
            assert.equal(JSON.stringify(expected), JSON.stringify(actual))
        })
    })

});
