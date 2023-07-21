import { assert } from 'chai';
import { Register } from '../../src/transactions/index.js';
import { AccountFactoryED25519 } from '../../src/accounts/index.js';
import { base58 } from '@scure/base';

describe('Register', () => {
  const account = new AccountFactoryED25519('T').createFromSeed('test');
  const accountA = new AccountFactoryED25519('T').createFromSeed('A');
  const accountB = new AccountFactoryED25519('T').createFromSeed('B');
  let transaction: Register;

  beforeEach(() => {
    transaction = new Register(accountA, accountB);
  });

  describe('#construction', () => {
    it('check the construction of a register transaction', () => {
      assert.equal(transaction.fee, 45000000);
    });
  });

  describe('#toBinary', () => {
    it('should return a binary tx V3', () => {
      transaction.version = 3;
      transaction.timestamp = new Date('2018-03-01T00:00:00+00:00').getTime();
      transaction.signWith(account);

      assert.equal(
        base58.encode(transaction.toBinary()),
        '3mti2ozrtqmjW4QZwQ6BLK5N9eooYaYecM5GLxjuKdUeUNAFdVstnDN9xGyHEJq5auxHjdfYqprPmmSqvqxAb8gNegm3HDZiP4PCubjvCzivKpbPM4fVRytoRsuTp9N7FM4yrczvMzVB4bdf2nc7EhWbQuFkpbq6YqnF',
      );
    });
  });

  describe('#ToJson', () => {
    it('should return a transaction to Json', () => {
      const expected = JSON.stringify({
        type: 20,
        version: 3,
        sender: '3N4mZ1qTrjWKnzBwAxscf7kfkoCs2HGQhJG',
        senderKeyType: 'ed25519',
        senderPublicKey: '2KduZAmAKuXEL463udjCQkVfwJkBQhpciUC4gNiayjSJ',
        fee: 45000000,
        timestamp: 1519862400000,
        accounts: [
          { keyType: 'ed25519', publicKey: 'G5cfhKBn1NfxgrL35FtbgQqRq6eRNTPRJRZDr5NGG15D' },
          { keyType: 'ed25519', publicKey: '5BgX9qHU3uMm32y6PStn4Z8iGy4qCowQ8rduhb5td5fm' },
        ],
        proofs: ['vuFw83PwGqiy6awZcMUd316v7W7XinGTRzADQDoAjZmHhy2rTntYJJep2YUMKPcFXAmR4ASxDqHp2Jpa1mnijDr'],
      });

      transaction.timestamp = new Date('2018-03-01T00:00:00+00:00').getTime();
      transaction.signWith(account);
      assert.equal(JSON.stringify(transaction), expected);
    });
  });

  describe('#from', () => {
    it('should return a transaction from the data', () => {
      const data = {
        type: 20,
        version: 3,
        sender: '3N4mZ1qTrjWKnzBwAxscf7kfkoCs2HGQhJG',
        senderKeyType: 'ed25519',
        senderPublicKey: '2KduZAmAKuXEL463udjCQkVfwJkBQhpciUC4gNiayjSJ',
        fee: 45000000,
        timestamp: 1519862400000,
        accounts: [
          { keyType: 'ed25519', publicKey: 'G5cfhKBn1NfxgrL35FtbgQqRq6eRNTPRJRZDr5NGG15D' },
          { keyType: 'ed25519', publicKey: '5BgX9qHU3uMm32y6PStn4Z8iGy4qCowQ8rduhb5td5fm' },
        ],
        proofs: ['43hhu7H5Yw7wC69BkSa42y2RpB1XqopaQFffzMh6WVKkmXe3oHWbv1qZxUBTj7Du7tMiiRyXUBFWTyqQ9Z7EVdgx'],
      };
      const actual = Register.from(data);
      assert.equal(JSON.stringify(actual), JSON.stringify(data));
    });
  });
});
