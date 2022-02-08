import { assert } from 'chai';
import { MassTransfer } from '../src/transactions/massTransfer'
import base58 from '../src/libs/base58';
import { AccountFactoryED25519 } from '../src/accounts/ed25519/AccountFactoryED25519';



const phrase = 'cool strike recall mother true topic road bright nature dilemma glide shift return mesh strategy';

describe('MassTransfer', () => {

    var account = new AccountFactoryED25519('T').createFromSeed(phrase);
    var attachment: string = 'What a nice Transfer'
    var transfers = [
        {"recipient": '3NACnKFVN2DeFYjspHKfa2kvDqnPkhjGCD2', "amount": 100000000},
        {"recipient": '3NACnKFVN2DeFYjspHKfa2kvDqnPkhjGCD2', "amount": 200000000},
    ];
    var transaction = new MassTransfer(transfers, attachment);


    describe('#toBinaryV3', () => {
        it('should return a binary tx V3', () => {
            assert.equal(base58.encode(transaction.toBinaryV3()),
                'UAj1op12kSSSDGyQGHHkKXqqwhp1AS2KQwtfosSqd6JM5QN1xq1uX5CkiVRbQzJAndmpkb6bHXW9cqsMcU8dcTuvPZo6qHdi2K4e3WBhkHKpwxBfyn6TEDYfVD7m1icgFtgvxrebUGvzHJzNPqsfCXB')
        })
    })

    describe('#toBinaryV1', () => {
        it('should return a binary tx V1', () => {
            assert.equal(base58.encode(transaction.toBinaryV1()),
                '7A11CMy4rBBb5ySeazbuiCxwKSaaiknwQjwQ4zq7NjCN5nvuPogDDBNvA8hBiaJTcLA8WbKt4Cr6rtJuXxiGDjSoATvXMiJKuhiNgw1HbLjBcBC6fy7dEsax8PGMGuKH3V3ZrqNRntKgXPVFyp4AKs')
        })
    })

    describe('#ToJson', () => {
        it('should return a transaction to Json', () => {
            let expected =  JSON.stringify({
                id: "",
                type: 11,
                version: 3,
                sender: '3N5PoiMisnbNPseVXcCa5WDRLLHkj7dz4Du',
                senderKeyType: 'ed25519',
                senderPublicKey: 'AneNBwCMTG1YQ5ShPErzJZETTsHEWFnPWhdkKiHG6VTX',
                fee: 120000000,
                timestamp: 1640353616132,
                proofs: [
                  '59zrhGSxuaa1GFaDVqFFvaCg8TJ3mNsvGnXvEc4Fs9kYqhB4GqYRcWcSFBvbSAfWQN8ngPCqZgD8Zf9JVkgMgBAd'
                ],
                attachment: '2DdU3NvpXxaG7ZgtjjM3nREs9ZgV',
                transfers: [
                  {
                    recipient: '3NACnKFVN2DeFYjspHKfa2kvDqnPkhjGCD2',
                    amount: 100000000
                  },
                  {
                    recipient: '3NACnKFVN2DeFYjspHKfa2kvDqnPkhjGCD2',
                    amount: 200000000
                  }
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
                txFee: 120000000,
                timestamp: 1640353616132,
                proofs: [
                    '4JekJ3PT3HZZ6SQ6VifxNHgh2vhFtEcjPxRjN5fSY8btxA6qs4UCt1F4kXR9H6tjHZP3VCVSFxyDuQCrGDfQEywo'
                ],
                sender: '3N5PoiMisnbNPseVXcCa5WDRLLHkj7dz4Du',
                senderPublicKey: 'AneNBwCMTG1YQ5ShPErzJZETTsHEWFnPWhdkKiHG6VTX',
                chainId: '',
                sponsor: '',
                sponsorPublicKey: '',
                senderKeyType: 'ed25519',
                sponsorKeyType: 'ed25519',
                transfers: [
                    {
                    recipient: '3NACnKFVN2DeFYjspHKfa2kvDqnPkhjGCD2',
                    amount: 100000000
                    },
                    {
                    recipient: '3NACnKFVN2DeFYjspHKfa2kvDqnPkhjGCD2',
                    amount: 200000000
                    }
                ],
                attachment: '2DdU3NvpXxaG7ZgtjjM3nREs9ZgV',
                type: 11,
                baseFee: 100000000,
                version: 1,
                transferData: new Uint8Array(0),
                id: '6B1CzTTjRDrVxERF226RTajCdyExUqPUSeHz1BKsSLph',
                height: ''
            }
            let transaction = new MassTransfer(expected['transfers'], expected['attachment']);
            let actual = transaction.fromData(expected)
            assert.equal(JSON.stringify(expected), JSON.stringify(actual))
        })
    })
});
