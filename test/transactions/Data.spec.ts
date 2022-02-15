import { assert } from 'chai';
import { Data } from '../../src/transactions/Data';
import { DataEntry } from '../../src/transactions/Data'
import base58 from '../../src/libs/base58';
import { AccountFactoryED25519 } from '../../src/accounts/ed25519/AccountFactoryED25519';


describe('Data', () => {

    var phrase = 'df3dd6d884714288a39af0bd973a1771c9f00f168cf040d6abb6a50dd5e055d8'
    var account = new AccountFactoryED25519('T').createFromSeed(phrase);
    var dataEntries = {
        "test": 1,
        "second": true
    }
    var transaction = new Data(dataEntries);

    describe('#testConstruct', () => {
        it('check the construction of a data transaction', () => {
            let dataObjects = transaction.data;
            assert.equal(dataObjects[0].key, 'test');
            assert.equal(dataObjects[0].type, 'integer');
            assert.equal(dataObjects[0].value, 1);
            assert.equal(dataObjects[1].key, 'second');
            assert.equal(dataObjects[1].type, 'boolean');
            assert.isTrue(dataObjects[1].value);
        })
    })

    describe('#ToJson', () => {
        it('should return a transaction to Json', () => {
            let expected =  JSON.stringify({
                id: "",
                type: 12,
                version: 3,
                sender: '3MtHYnCkd3oFZr21yb2vEdngcSGXvuNNCq2',
                senderKeyType: 'ed25519',
                senderPublicKey: '4EcSxUkMxqxBEBUBL2oKz3ARVsbyRJTivWpNrYQGdguz',
                fee: 110000000,
                timestamp: 1610582400000,
                proofs: [
                  '3KTb4F8c9s2U8B9rtwTYfvxuf1BzBjhFbwzxCC9hetRZEpLVhK5GGBnyhz7f9VQUAhh6iUfCKbb2b3aMMRw8DWNi'
                ],
                height: ""
            })
            transaction.timestamp = 1610582400000
            transaction.signWith(account)
            let json_transaction = transaction.toJson();
            let map = json_transaction.accounts;
            delete json_transaction.accounts;
            assert.equal(JSON.stringify(json_transaction), expected);
            assert.equal(JSON.stringify(map), JSON.stringify([{'key': 'test', 'type': 'integer', 'value': 1},
            {'key': 'second', 'type': 'boolean', 'value': true}]));
        })
    })

    describe('#FromData', () => {
        it('should return a transaction from the data', () => {
            let expected =  {
                txFee: 45000000,
                timestamp: 1610582400000,
                proofs: [
                  '2E55111TcfD7nAPvCwk1TvpGXHAdHoHxqL17D9MkLaB8t83XqDGPhXCwNfZ6zGrRmGZoNevt8Rf5C2aHBuv97YK1'
                ],
                sender: '3MtHYnCkd3oFZr21yb2vEdngcSGXvuNNCq2',
                senderPublicKey: '4EcSxUkMxqxBEBUBL2oKz3ARVsbyRJTivWpNrYQGdguz',
                chainId: '',
                sponsor: '',
                sponsorPublicKey: '',
                senderKeyType: 'ed25519',
                sponsorKeyType: 'ed25519',
                data: [{'key': 'test', 'type': 'integer', 'value': 1},
                {'key': 'second', 'type': 'boolean', 'value': true}],
                type: 12,
                version: 3,
                id: 'DgCGGoofcEoQj5pV45SgEBq77ymkGkKkHPc522YAmGMn',
                height: ''
            }
            let actual = transaction.fromData(expected)
            assert.equal(JSON.stringify(expected), JSON.stringify(actual))
        })
    })

    describe('#testFromDataEntry', () => {
        it('check the from data function of the DataEntry class', () => {
            let data = [{'key': 'test', 'type': 'integer', 'value': 1},
            {'key': 'second', 'type': 'boolean', 'value': true}]

            for (let i = 0; i < Object.values(data).length; i++){
                let ret = DataEntry.fromData(Object.values(data)[i]);
                for (let j in Object.values(data)[i])
                    assert.equal(ret[j], Object.values(data)[i][j]);
            }
            
        })
    })

});
