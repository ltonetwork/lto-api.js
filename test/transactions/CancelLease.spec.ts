import { assert } from 'chai';
import { CancelLease } from '../../src/transactions/index.js/';
import { base58 } from '@scure/base';
import { AccountFactoryED25519 } from '../../src/accounts/index.js';

describe('CancelLease', () => {
  const account = new AccountFactoryED25519('T').createFromSeed('test');
  const leaseId = 'ELtXhrFTCRJSEweYAAaVTuv9wGjNzwHYUDnH6UT1JxmB';
  let transaction: CancelLease;

  beforeEach(() => {
    transaction = new CancelLease(leaseId);
  });

  describe('#toBinary', () => {
    it('should return a binary tx V3', () => {
      transaction.signWith(account);
      transaction.timestamp = new Date('2018-03-01T00:00:00+00:00').getTime();
      transaction.version = 3;

      assert.equal(
        base58.encode(transaction.toBinary()),
        'eGyiRd1Vx21nYCWTjHichz6KVfhs2LBMRza2FrwmSxnE8GQdLNcuPfK3RpEuUtc1QJnw9y7fCsLt3xQWKVdMXm7iBhVK8mtTzLPCfGenFWYxjVPsUH',
      );
    });

    it('should return a binary tx V2', () => {
      transaction.signWith(account);
      transaction.timestamp = new Date('2018-03-01T00:00:00+00:00').getTime();
      transaction.version = 2;

      assert.equal(
        base58.encode(transaction.toBinary()),
        '9ScRzCmHigdLyhgUpUYu9W5ug9QEqKuE676MP7q1Lfdb3AS4GzcwLN24u6KBiaEGQdJTQSW6Vg83jQCLZKX8pKDZR2fTuJP6H4L3nawtjsykEd59w',
      );
    });
  });

  describe('#ToJson', () => {
    it('should return a transaction to Json', () => {
      const expected = JSON.stringify({
        type: 9,
        version: 3,
        sender: '3N4mZ1qTrjWKnzBwAxscf7kfkoCs2HGQhJG',
        senderKeyType: 'ed25519',
        senderPublicKey: '2KduZAmAKuXEL463udjCQkVfwJkBQhpciUC4gNiayjSJ',
        fee: 100000000,
        timestamp: 1519862400000,
        proofs: ['2EooGBGAjiaWT4H8FUJehoSB9Hvx1zuoH3d9jRiwnhfERj84NhLNJh5WVcvw7c4xSjntu4hjmKSW35CVtQVfjVsF'],
        leaseId: 'ELtXhrFTCRJSEweYAAaVTuv9wGjNzwHYUDnH6UT1JxmB',
      });
      transaction.timestamp = new Date('2018-03-01T00:00:00+00:00').getTime();
      transaction.signWith(account);
      assert.equal(JSON.stringify(transaction), expected);
    });
  });

  describe('#from', () => {
    it('should return a transaction from the data', () => {
      const data = {
        type: 9,
        version: 3,
        sender: '3N4mZ1qTrjWKnzBwAxscf7kfkoCs2HGQhJG',
        senderKeyType: 'ed25519',
        senderPublicKey: '2KduZAmAKuXEL463udjCQkVfwJkBQhpciUC4gNiayjSJ',
        fee: 100000000,
        timestamp: 1519862400000,
        proofs: ['2EooGBGAjiaWT4H8FUJehoSB9Hvx1zuoH3d9jRiwnhfERj84NhLNJh5WVcvw7c4xSjntu4hjmKSW35CVtQVfjVsF'],
        leaseId: 'ELtXhrFTCRJSEweYAAaVTuv9wGjNzwHYUDnH6UT1JxmB',
      };
      const actual = CancelLease.from(data);
      assert.equal(JSON.stringify(actual), JSON.stringify(data));
    });
  });
});
