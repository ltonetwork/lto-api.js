import { assert } from 'chai';
import { Lease } from '../../src/transactions';
import * as base58 from '../../src/libs/base58';
import { AccountFactoryED25519 } from '../../src/accounts';

describe('Lease', () => {
  const account = new AccountFactoryED25519('T').createFromSeed('test');
  const recipient = '3NACnKFVN2DeFYjspHKfa2kvDqnPkhjGCD2';
  const amount = 100000000;
  let transaction: Lease;

  beforeEach(() => {
    transaction = new Lease(recipient, amount);
  });

  describe('#toBinary', () => {
    it('should return a binary tx V3', () => {
      transaction.version = 3;
      transaction.timestamp = new Date('2018-03-01T00:00:00+00:00').getTime();
      transaction.signWith(account);

      assert.equal(
        base58.encode(transaction.toBinary()),
        'C8ccc2XXTenRExRLJDL7f6AGaRYgnPgSLu4MDthRVx4pU9XaiG7dKR1f55L6dXCN8TJ3xEYZC8oSGZCB5yZirKLAWHeNyr1FsFbXQbsBNCTYpZbZuZXzX',
      );
    });

    it('should return a binary tx V2', () => {
      transaction.version = 2;
      transaction.timestamp = new Date('2018-03-01T00:00:00+00:00').getTime();
      transaction.signWith(account);

      assert.equal(
        base58.encode(transaction.toBinary()),
        '3XBHG522cz4FJeaE4mDGe3y6Lm3kgMDiGUVoqkBdMk99WmW8iTqgMZWphFq1uvWiNhKRxc1kiafXiPcLRj5ds2rQZa9m3CPAgMjj9Fp5GwD8gbBQbZLs',
      );
    });
  });

  describe('#ToJson', () => {
    it('should return a transaction to Json', () => {
      const expected = JSON.stringify({
        type: 8,
        version: 3,
        sender: '3N4mZ1qTrjWKnzBwAxscf7kfkoCs2HGQhJG',
        senderKeyType: 'ed25519',
        senderPublicKey: '2KduZAmAKuXEL463udjCQkVfwJkBQhpciUC4gNiayjSJ',
        fee: 100000000,
        timestamp: 1519862400000,
        recipient: '3NACnKFVN2DeFYjspHKfa2kvDqnPkhjGCD2',
        amount: 100000000,
        proofs: ['Fo7CkFeEbRqirb3iewRRs1rzDfUPfGNf7pSt7zWcvdXMJvDWwrsYwtiasr3y1ixsB6coHMgCZSvxV9W4xsorCLX'],
      });
      transaction.timestamp = new Date('2018-03-01T00:00:00+00:00').getTime();
      transaction.signWith(account);
      assert.equal(JSON.stringify(transaction), expected);
    });
  });

  describe('#from', () => {
    it('should return a transaction from the data', () => {
      const data = {
        type: 8,
        version: 3,
        sender: '3N4mZ1qTrjWKnzBwAxscf7kfkoCs2HGQhJG',
        senderKeyType: 'ed25519',
        senderPublicKey: '2KduZAmAKuXEL463udjCQkVfwJkBQhpciUC4gNiayjSJ',
        fee: 100000000,
        timestamp: 1519862400000,
        recipient: '3NACnKFVN2DeFYjspHKfa2kvDqnPkhjGCD2',
        amount: 100000000,
        proofs: ['Fo7CkFeEbRqirb3iewRRs1rzDfUPfGNf7pSt7zWcvdXMJvDWwrsYwtiasr3y1ixsB6coHMgCZSvxV9W4xsorCLX'],
      };
      const actual = Lease.from(data);
      assert.equal(JSON.stringify(actual), JSON.stringify(data));
    });
  });
});
