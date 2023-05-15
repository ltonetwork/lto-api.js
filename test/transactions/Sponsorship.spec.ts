import { assert } from 'chai';
import { Sponsorship } from '../../src/transactions';
import { base58 } from '@scure/base';
import { AccountFactoryED25519 } from '../../src/accounts';

describe('Sponsorship', () => {
  const account = new AccountFactoryED25519('T').createFromSeed('test');
  const recipient = '3NACnKFVN2DeFYjspHKfa2kvDqnPkhjGCD2';
  let transaction: Sponsorship;

  beforeEach(() => {
    transaction = new Sponsorship(recipient);
  });

  describe('#toBinary', () => {
    it('should return a binary tx V3', () => {
      transaction.version = 3;
      transaction.timestamp = new Date('2018-03-01T00:00:00+00:00').getTime();
      transaction.signWith(account);

      assert.equal(
        base58.encode(transaction.toBinary()),
        'atrk25dhE856q2qSEPm6umwL1kPTiZ7CtCojL7SRSnYYWqM24jtQFffmWP3n9vt3VPQ5cahaMoWuYjYAVvA7hA6apBwSrNyf2DhFYuXwME',
      );
    });

    it('should return a binary tx V1', () => {
      transaction.version = 1;
      transaction.timestamp = new Date('2018-03-01T00:00:00+00:00').getTime();
      transaction.signWith(account);

      assert.equal(
        base58.encode(transaction.toBinary()),
        '8gCPwExgz2sxHQ5nMn2tsgwvPfMtaXvms3bZVA6yiK9iLHdPRWSqp9SfGyx7x5AnWB1DdZyTEERsu1z8ofPFwowd532zRxD4LQjfL3Lcf',
      );
    });
  });

  describe('#ToJson', () => {
    it('should return a transaction to Json', () => {
      const expected = JSON.stringify({
        type: 18,
        version: 3,
        sender: '3N4mZ1qTrjWKnzBwAxscf7kfkoCs2HGQhJG',
        senderKeyType: 'ed25519',
        senderPublicKey: '2KduZAmAKuXEL463udjCQkVfwJkBQhpciUC4gNiayjSJ',
        recipient: '3NACnKFVN2DeFYjspHKfa2kvDqnPkhjGCD2',
        timestamp: 1519862400000,
        fee: 500000000,
        proofs: ['62Bvxw1mgohem19eBkt4dER416RdPBSeKALhy4Xo17LwCXQMo2jrYERaoThYHXBMgF4GgC124BhdWb3KhiBoKN9T'],
      });
      transaction.timestamp = new Date('2018-03-01T00:00:00+00:00').getTime();
      transaction.signWith(account);
      assert.equal(JSON.stringify(transaction), expected);
    });
  });

  describe('#from', () => {
    it('should return a transaction from the data', () => {
      const data = {
        type: 18,
        version: 3,
        sender: '3N4mZ1qTrjWKnzBwAxscf7kfkoCs2HGQhJG',
        senderKeyType: 'ed25519',
        senderPublicKey: '2KduZAmAKuXEL463udjCQkVfwJkBQhpciUC4gNiayjSJ',
        recipient: '3NACnKFVN2DeFYjspHKfa2kvDqnPkhjGCD2',
        timestamp: 1519862400000,
        fee: 500000000,
        proofs: ['5zJbstoCjpcFsm8uvM9AmsDRrAy6GGbqnnzC2ZS46DqN75X2XU8w3BdcU4uiJH1PfwmAzAq7A7JHirAA1E3iPsZy'],
      };
      const actual = Sponsorship.from(data);
      assert.equal(JSON.stringify(actual), JSON.stringify(data));
    });
  });
});
