import { assert } from 'chai';
import { Burn } from '../../src/transactions';
import { base58 } from '@scure/base';
import { AccountFactoryED25519 } from '../../src/accounts';

describe('Burn', () => {
  const account = new AccountFactoryED25519('T').createFromSeed('test');
  const amount = 100000000;
  let transaction: Burn;

  beforeEach(() => {
    transaction = new Burn(amount);
  });

  describe('#toBinary', () => {
    it('should return a binary tx V3', () => {
      transaction.version = 3;
      transaction.timestamp = new Date('2018-03-01T00:00:00+00:00').getTime();
      transaction.signWith(account);
      assert.equal(
        base58.encode(transaction.toBinary()),
        '4iye1kbNGbgBGjGS3wJA9ZXrVfqhQu3YDrhwkocGMDHTuME92QucbbMG4ewdoDxTE6Ddput4Yh9K21JsYj',
      );
    });
  });

  describe('#ToJson', () => {
    it('should return a transaction to Json', () => {
      const expected = JSON.stringify({
        type: 21,
        version: 3,
        sender: '3N4mZ1qTrjWKnzBwAxscf7kfkoCs2HGQhJG',
        senderKeyType: 'ed25519',
        senderPublicKey: '2KduZAmAKuXEL463udjCQkVfwJkBQhpciUC4gNiayjSJ',
        fee: 100000000,
        timestamp: 1519862400000,
        amount: 100000000,
        proofs: ['3jRzwu8XyHtnUEUNH9bcFnxgMktD57CZpbnAUQc7kMkEBpXKT7UzUvDJje2hsuHwAwurX7EfAhjqzrPuCdZta1Yi'],
      });
      transaction.timestamp = new Date('2018-03-01T00:00:00+00:00').getTime();
      transaction.signWith(account);
      assert.equal(JSON.stringify(transaction), expected);
    });
  });

  describe('#from', () => {
    it('should return a transaction from the data', () => {
      const expected = {
        type: 21,
        version: 3,
        sender: '3N4mZ1qTrjWKnzBwAxscf7kfkoCs2HGQhJG',
        senderKeyType: 'ed25519',
        senderPublicKey: '2KduZAmAKuXEL463udjCQkVfwJkBQhpciUC4gNiayjSJ',
        fee: 100000000,
        timestamp: 1519862400000,
        amount: 100000000,
        proofs: ['3jRzwu8XyHtnUEUNH9bcFnxgMktD57CZpbnAUQc7kMkEBpXKT7UzUvDJje2hsuHwAwurX7EfAhjqzrPuCdZta1Yi'],
      };
      const actual = Burn.from(expected);
      assert.equal(JSON.stringify(expected), JSON.stringify(actual));
    });
  });
});
