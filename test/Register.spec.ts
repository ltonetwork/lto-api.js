import { assert } from 'chai';
import { Register } from '../src/transactions/register';
import base58 from '../src/libs/base58';
import { AccountFactoryED25519 } from '../src/classes/AccountFactories/AccountFactoryED25519';


describe('Register', () => {

    var phrase = "df3dd6d884714288a39af0bd973a1771c9f00f168cf040d6abb6a50dd5e055d8";
    var account = new AccountFactoryED25519('T').createFromSeed(phrase);
    var account2 = new AccountFactoryED25519('T').createFromSeed('tree ship container raccoon cup water mother');
    var account3 = new AccountFactoryED25519('T').createFromSeed('milk animal bottle raccoon yellow green');

    var transaction = new Register(account2, account3);

    describe('#testConstruct', () => {
        it('check the construction of a register transaction', () => {
            assert.equal(transaction.txFee, 45000000);
        })
    })

    describe('#testConstruct', () => {
        it('check the construction of a data transaction', () => {
            
        })
    })

    describe('#ToJson', () => {
        it('should return a transaction to Json', () => {
            let expected =  JSON.stringify({
                type: 20,
                version: 3,
                sender: '3MtHYnCkd3oFZr21yb2vEdngcSGXvuNNCq2',
                senderKeyType: 'ed25519',
                senderPublicKey: '4EcSxUkMxqxBEBUBL2oKz3ARVsbyRJTivWpNrYQGdguz',
                fee: 45000000,
                timestamp: 1326499200000,
                accounts: [{'keyType': 'ed25519', 'publicKey': '8VNd1qLRyRSNdqfkjDffpFkdeUrPCGEL3btzkcr98ykX'},
             {'keyType': 'ed25519', 'publicKey': '7YVCTAzyAjrtRw5RsxjfonCn3tUrfgtYcy5xd2niqWDa'}],
                proofs: [
                  '5zndzMGsoTkiGGDAqkCK8VHJ7vephZHubYRifSfDopUUGuHwSBhhSeoCB6FvLAH6NZmGncwABuPePFzBAM9riWzJ'
                ]
            })
            transaction.timestamp = 1326499200000
            transaction.signWith(account)
            assert.equal(JSON.stringify(transaction.toJson()), expected);
        })
    })

    describe('#FromData', () => {
        it('should return a transaction from the data', () => {
            let expected =  {
                txFee: 45000000,
                timestamp: 1326499200000,
                proofs: [
                  '2omugkAQdrm9P7YPx6WZbXMBTifRS6ptaTT8rPRRvKFr1EPFafHSosq6HzkuuLv78gR6vaXLA9WtMsTSBgi3H1qe'
                ],
                sender: '3Jq8mnhRquuXCiFUwTLZFVSzmQt3Fu6F7HQ',
                senderPublicKey: 'AJVNfYjTvDD2GWKPejHbKPLxdvwXjAnhJzo6KCv17nne',
                chainId: '',
                sponsor: '',
                sponsorPublicKey: '',
                senderKeyType: 'ed25519',
                sponsorKeyType: 'ed25519',
                accounts: [{'keyType': 'ed25519', 'publicKey': '8VNd1qLRyRSNdqfkjDffpFkdeUrPCGEL3btzkcr98ykX'},
                         {'keyType': 'ed25519', 'publicKey': '7YVCTAzyAjrtRw5RsxjfonCn3tUrfgtYcy5xd2niqWDa'}],
                type: 20,
                version: 3,
                id: '8M6dgn85eh3bsHrVhWng8FNaHBcHEJD4MPZ5ZzCciyon',
                height: 1069662
            }
            let actual = transaction.fromData(expected)
            assert.equal(JSON.stringify(expected), JSON.stringify(actual))
        })
    })

});
