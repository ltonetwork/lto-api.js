import { assert } from 'chai';
import { AccountFactoryED25519 } from '../src/accounts/ed25519/AccountFactoryED25519';
import { Association } from '../src/transactions/association'
import base58 from '../src/libs/base58';



const phrase = 'cool strike recall mother true topic road bright nature dilemma glide shift return mesh strategy';

describe('Association', () => {

    var account = new AccountFactoryED25519('T').createFromSeed(phrase);
    var anchor:string = '7ab62201df228f2c92ec74c29c61889b9658f4eef6a9a4a51bd25f23c9fcf376'
    var recipient:string = '3NACnKFVN2DeFYjspHKfa2kvDqnPkhjGCD2';
    var associationType: number = 10
    var expires:number = 0
    var transaction = new Association(recipient, associationType, anchor, expires);


    describe('#toBinaryV3', () => {
        it('should return a binary tx V3', () => {
            assert.equal(base58.encode(transaction.toBinaryV3()),
                '4HqetbbQjvWkDNgaBCoXZXzb4R7pJ54eyoqwvTgPpr1JoSSd4APsjmV4ifomDDUTtXBBcs27QhU5q3M6xF5rqbjT8EE27yvYidAc1xz97ZPvtCVYJ9viAGsB2AMeLB6AozNJ2PUjkw4FSHKmC8kqz8rq9Tu3oN5EgrsrtYuB')
        })
    })

    describe('#toBinaryV1', () => {
        it('should return a binary tx V1', () => {
            assert.equal(base58.encode(transaction.toBinaryV1()),
                '5TVpzKvus4nV1ceZQTkjVBB71TmnYtfxcTB8SLh9vmz3dHAKYnbxpCSQF9GCKVsL1A1bgzAuEGBewCGWKuD4pnEZd4gEJcXdtRxXfZHdwSvHXYWYue3JXQ75EtXmHZvkkDDzGiGSTWgKCo4vW5wysy677uE3y')
        })
    })

    describe('#ToJson', () => {
        it('should return a transaction to Json', () => {
            let expected =  JSON.stringify({
                type: 16,
                version: 3,
                sender: '3N5PoiMisnbNPseVXcCa5WDRLLHkj7dz4Du',
                senderKeyType: 'ed25519',
                senderPublicKey: 'AneNBwCMTG1YQ5ShPErzJZETTsHEWFnPWhdkKiHG6VTX',
                recipient: '3NACnKFVN2DeFYjspHKfa2kvDqnPkhjGCD2',
                associationType: 10,
                expires: 0,
                fee: 100000000,
                timestamp: 1640341125640,
                hash: '27DjBot2tGXZT7SCuu9fyEu7pNrXbaeXWUeuYB21D6jCENWeEH1G6hV4BR97YXx7ZPaUHELCGeuLAFA3Ruo2gZkH',
                proofs: [
                  '4SYAJuygUmqFQtH6D5eN671Y1XT31yg1Es9pRxVz8QRHgtJQrLU8FiicUZYira959YHdLDRwYiZoSfd7FVKrPjwg'
                ]
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
                  '4SYAJuygUmqFQtH6D5eN671Y1XT31yg1Es9pRxVz8QRHgtJQrLU8FiicUZYira959YHdLDRwYiZoSfd7FVKrPjwg'
                ],
                sender: '3N5PoiMisnbNPseVXcCa5WDRLLHkj7dz4Du',
                senderPublicKey: 'AneNBwCMTG1YQ5ShPErzJZETTsHEWFnPWhdkKiHG6VTX',
                chainId: '',
                sponsor: '',
                sponsorPublicKey: '',
                senderKeyType: 'ed25519',
                sponsorKeyType: 'ed25519',
                recipient: '3NACnKFVN2DeFYjspHKfa2kvDqnPkhjGCD2',
                associationType: 10,
                anchor: '27DjBot2tGXZT7SCuu9fyEu7pNrXbaeXWUeuYB21D6jCENWeEH1G6hV4BR97YXx7ZPaUHELCGeuLAFA3Ruo2gZkH',
                version: 3,
                type: 16,
                expires: 0,
                id: 'DtZ2z6WX7o3RQM9rQBta2SJigbUxe5EzY8qTVqwBtSiK',
                height: ''
              }
            let transaction = new Association(expected['recipient'], expected['associationType'], expected['anchor'], expected['expires']);
            let actual = transaction.fromData(expected)
            assert.equal(JSON.stringify(expected), JSON.stringify(actual))
        })
    })
});
