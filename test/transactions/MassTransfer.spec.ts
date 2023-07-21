import { assert } from 'chai';
import { MassTransfer } from '../../src/transactions';
import { base58 } from '@scure/base';
import { AccountFactoryED25519 } from '../../src/accounts';

describe('MassTransfer', () => {
  const account = new AccountFactoryED25519('T').createFromSeed('test');
  const attachment = 'hello';
  const transfers = [
    { recipient: '3NACnKFVN2DeFYjspHKfa2kvDqnPkhjGCD2', amount: 100000000 },
    { recipient: '3NACnKFVN2DeFYjspHKfa2kvDqnPkhjGCD2', amount: 200000000 },
  ];
  let transaction: MassTransfer;

  beforeEach(() => {
    transaction = new MassTransfer(transfers, attachment);
  });

  describe('#toBinary', () => {
    it('should return a binary tx V3', () => {
      transaction.version = 3;
      transaction.timestamp = new Date('2018-03-01T00:00:00+00:00').getTime();
      transaction.signWith(account);

      assert.equal(
        base58.encode(transaction.toBinary()),
        '5yWB6ySi77vhcPv6c4DN3463tRnvDMYFuFJ6HtgKFLFbp7AGgbcqe2CtFLLdKkdf6c1qdL5PTD66Xr3Wsq2gvLC9kDcd7TLB7mm3resYaKz6f8qN2Txoy3QDqcPK8AeNukwRKH552cpmZNim4TfsHx3x3SjXsVYLzDTuyWiy2Ugjfeqk',
      );
    });

    it('should return a binary tx V1', () => {
      transaction.version = 1;
      transaction.timestamp = new Date('2018-03-01T00:00:00+00:00').getTime();
      transaction.signWith(account);

      assert.equal(
        base58.encode(transaction.toBinary()),
        'FoEmbyoG6H4g4JS6Su8yXvb2YZou9GGAHtj3mc45wieDA11w4tzWY3xGWQYWSpKwJ8Kw2vF8Msngc5uZB2a4g9urGb7fNtNcqWdayJ7TetKj49DVfcwN7AEW8DBSUKd713dqpLkqF4dZLx22nG1BNTi2FGgVCRS28UQt9nxMSpsyG',
      );
    });
  });

  describe('#ToJson', () => {
    it('should return a transaction to Json', () => {
      const expected = JSON.stringify({
        type: 11,
        version: 3,
        sender: '3N4mZ1qTrjWKnzBwAxscf7kfkoCs2HGQhJG',
        senderKeyType: 'ed25519',
        senderPublicKey: '2KduZAmAKuXEL463udjCQkVfwJkBQhpciUC4gNiayjSJ',
        fee: 120000000,
        timestamp: 1519862400000,
        transfers: [
          { recipient: '3NACnKFVN2DeFYjspHKfa2kvDqnPkhjGCD2', amount: 100000000 },
          { recipient: '3NACnKFVN2DeFYjspHKfa2kvDqnPkhjGCD2', amount: 200000000 },
        ],
        attachment: 'Cn8eVZg',
        proofs: ['55FQaETSGdP7GexKg7gkmnV4WijLfxwCR1f23bP92PrEmNbfirktmyjYgNQGYRCipi8kStaUpWCTnk3fWxe6J4Z4'],
      });

      transaction.timestamp = new Date('2018-03-01T00:00:00+00:00').getTime();
      transaction.signWith(account);
      assert.equal(JSON.stringify(transaction), expected);
    });
  });

  describe('#from', () => {
    it('should return a transaction from the data', () => {
      const data = {
        type: 11,
        version: 3,
        sender: '3N4mZ1qTrjWKnzBwAxscf7kfkoCs2HGQhJG',
        senderKeyType: 'ed25519',
        senderPublicKey: '2KduZAmAKuXEL463udjCQkVfwJkBQhpciUC4gNiayjSJ',
        fee: 120000000,
        timestamp: 1519862400000,
        transfers: [
          { recipient: '3NACnKFVN2DeFYjspHKfa2kvDqnPkhjGCD2', amount: 100000000 },
          { recipient: '3NACnKFVN2DeFYjspHKfa2kvDqnPkhjGCD2', amount: 200000000 },
        ],
        attachment: 'Cn8eVZg',
        proofs: ['55FQaETSGdP7GexKg7gkmnV4WijLfxwCR1f23bP92PrEmNbfirktmyjYgNQGYRCipi8kStaUpWCTnk3fWxe6J4Z4'],
      };
      const actual = MassTransfer.from(data);
      assert.equal(JSON.stringify(actual), JSON.stringify(data));
    });
  });
});
