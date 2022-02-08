import { assert } from 'chai';
import { RevokeAssociation } from '../src/transactions/revokeAssociation'
import base58 from '../src/libs/base58';
import { AccountFactoryED25519 } from '../src/accounts/ed25519/AccountFactoryED25519';



const phrase = 'cool strike recall mother true topic road bright nature dilemma glide shift return mesh strategy';

describe('RevokeAssociation', () => {

    var account = new AccountFactoryED25519('T').createFromSeed(phrase);
    var anchor:string = '7ab62201df228f2c92ec74c29c61889b9658f4eef6a9a4a51bd25f23c9fcf376'
    var recipient:string = '3NACnKFVN2DeFYjspHKfa2kvDqnPkhjGCD2';
    var associationType: number = 10
    var transaction = new RevokeAssociation(recipient, associationType, anchor);


    describe('#toBinaryV3', () => {
        it('should return a binary tx V3', () => {
            assert.equal(base58.encode(transaction.toBinaryV3()),
                '5jeB3D3i7wTxgkLTRiY2JSnvdxHtgnmYZHgMz9hWmTpoQjG5hTpoi1Voq86bmDCLJZoCuoYgAELANYJQdrns2mTGJyfxBs6o49R373C2bCEEoY8eq9Q1TVjMjrcWSnc7a5fjYKErYJpjTnqFFnJmmZpqYWxQD')
        })
    })

    describe('#toBinaryV1', () => {
        it('should return a binary tx V1', () => {
            assert.equal(base58.encode(transaction.toBinaryV1()),
                '5jeC9CxHPifdCW57jQV7A8nSMRY89LygMZADrAPkoo9AEzmQSQaGyYEvmR7icVnBLtFdeBnQNJU6tEhuaW6QpSu71oZUwMEKXC95EfqpMDD659ahJNiXDRwmnyuXKQUybbE7EoCdT6o3webZRWdqqQ5HDi6Ru')
        })
    })

    describe('#ToJson', () => {
        it('should return a transaction to Json', () => {
            let expected =  JSON.stringify({
                id: "",
                type: 17,
                version: 3,
                sender: '3N5PoiMisnbNPseVXcCa5WDRLLHkj7dz4Du',
                senderKeyType: 'ed25519',
                senderPublicKey: 'AneNBwCMTG1YQ5ShPErzJZETTsHEWFnPWhdkKiHG6VTX',
                recipient: '3NACnKFVN2DeFYjspHKfa2kvDqnPkhjGCD2',
                associationType: 10,
                fee: 100000000,
                timestamp: 1640341125640,
                hash: '27DjBot2tGXZT7SCuu9fyEu7pNrXbaeXWUeuYB21D6jCENWeEH1G6hV4BR97YXx7ZPaUHELCGeuLAFA3Ruo2gZkH',
                proofs: [
                '4LUFV4sKLsLzHe8xkGEXpTqRJmd88iFVQgB3YnfvAhxuHmq16rtFp2kRC1G4C9LbAstwUnN9AJVocViL1pd5M6b7'
                ],
                height: ""
            })
            transaction.timestamp = 1640341125640
            transaction.signWith(account)
            assert.equal(JSON.stringify(transaction.toJson()), expected);
        })
    })

    describe('#FromData', () => {
        it('should return a transaction from the data', () => {
            let expected =  {
                txFee: 100000000,
                timestamp: 1640341125640,
                proofs: [
                  '4LUFV4sKLsLzHe8xkGEXpTqRJmd88iFVQgB3YnfvAhxuHmq16rtFp2kRC1G4C9LbAstwUnN9AJVocViL1pd5M6b7'
                ],
                sender: '3N5PoiMisnbNPseVXcCa5WDRLLHkj7dz4Du',
                senderPublicKey: 'AneNBwCMTG1YQ5ShPErzJZETTsHEWFnPWhdkKiHG6VTX',
                chainId: '',
                sponsor: '',
                sponsorPublicKey: '',
                senderKeyType: 'ed25519',
                sponsorKeyType: 'ed25519',
                recipient: undefined,
                associationType: 10,
                anchor: '27DjBot2tGXZT7SCuu9fyEu7pNrXbaeXWUeuYB21D6jCENWeEH1G6hV4BR97YXx7ZPaUHELCGeuLAFA3Ruo2gZkH',
                version: 3,
                type: 17,
                id: '2USLzTMU1LrqpRL9uT6Ta7q5AyjqBRFDuB1gMY1CSQgS',
                expires: 0,
                height: ''
              }
            let transaction = new RevokeAssociation(expected['recipient'], expected['associationType'], expected['anchor']);
            let actual = transaction.fromData(expected)
            assert.equal(JSON.stringify(expected), JSON.stringify(actual))
        })
    })
});
