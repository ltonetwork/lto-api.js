import { assert } from 'chai';
import { Anchor } from '../../src/transactions/index.js';
import { base58 } from '@scure/base';
import { AccountFactoryED25519 } from '../../src/accounts/index.js';
import Binary from '../../src/Binary';
import { bytesToHex } from '@noble/hashes/utils';

describe('Anchor', () => {
  const account = new AccountFactoryED25519('T').createFromSeed('test');
  const sponsor = new AccountFactoryED25519('T').createFromSeed('test sponsor');
  const hash = Binary.fromHex('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  let transaction: Anchor;

  beforeEach(() => {
    transaction = new Anchor(hash);
  });

  describe('#toBinary', () => {
    it('should return a binary tx V3', () => {
      transaction.signWith(account);
      transaction.timestamp = new Date('2018-03-01T00:00:00+00:00').getTime();
      transaction.version = 3;

      assert.equal(
        bytesToHex(transaction.toBinary()),
        '0f035400000161dedbc4000113a1df11d971debe13fc1b7bcb42473de28074da7595c302e20f57708b75cdd30000000002160ec000010020e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      );
    });

    it('should return a binary tx V1', () => {
      transaction.signWith(account);
      transaction.timestamp = new Date('2018-03-01T00:00:00+00:00').getTime();
      transaction.version = 1;

      assert.equal(
        base58.encode(transaction.toBinary()),
        'MquGbi8ADEhTeqTgfXUdud2D1oKPTYrGRXaJ4BcmirU3V3LEQPfzckNyjHaHiNKyDyVhUZQ1LnnkbLgpdQZhkpyHGApnfD92bh9bXrSQdFXTuKBvPpGZD',
      );
    });
  });

  describe('#toJson', () => {
    it('should return a transaction to Json', () => {
      const expected = JSON.stringify({
        type: 15,
        version: 3,
        sender: '3N4mZ1qTrjWKnzBwAxscf7kfkoCs2HGQhJG',
        senderKeyType: 'ed25519',
        senderPublicKey: '2KduZAmAKuXEL463udjCQkVfwJkBQhpciUC4gNiayjSJ',
        fee: 35000000,
        timestamp: 1519862400000,
        anchors: ['GKot5hBsd81kMupNCXHaqbhv3huEbxAFMLnpcX2hniwn'],
        proofs: ['5L1N7h7jxSeG7gATTqRibDwHvuHBW57uy78WDxHivybEhdVXKN5F7tBSbytgWqTwXbqWEMaD2J3qmTFALyDAwyrJ'],
      });
      transaction.timestamp = new Date('2018-03-01T00:00:00+00:00').getTime();
      transaction.signWith(account);
      assert.equal(JSON.stringify(transaction), expected);
    });

    it('should return a transaction to Json with the sponsor data', () => {
      const expected = JSON.stringify({
        type: 15,
        version: 3,
        sender: '3N4mZ1qTrjWKnzBwAxscf7kfkoCs2HGQhJG',
        senderKeyType: 'ed25519',
        senderPublicKey: '2KduZAmAKuXEL463udjCQkVfwJkBQhpciUC4gNiayjSJ',
        sponsor: '3MqcESZ7AwBfuxVBroU7Ntp6gDX2TVwUEyy',
        sponsorKeyType: 'ed25519',
        sponsorPublicKey: 'FpvqV1Ae6wiUwmdjaRZcSuYujKk29qrtBTqtSbmGrtdC',
        fee: 35000000,
        timestamp: 1519862400000,
        anchors: ['GKot5hBsd81kMupNCXHaqbhv3huEbxAFMLnpcX2hniwn'],
        proofs: [
          '5L1N7h7jxSeG7gATTqRibDwHvuHBW57uy78WDxHivybEhdVXKN5F7tBSbytgWqTwXbqWEMaD2J3qmTFALyDAwyrJ',
          '5992qrUQehcLbJQgWsGPCggZbYWghp6souCzVUhQykk1VxwkrSWTs2Anx7XiTki812R1r96nM8Pehn5NUdRcz5T3',
        ],
      });
      transaction.timestamp = new Date('2018-03-01T00:00:00+00:00').getTime();
      transaction.signWith(account);
      transaction.sponsorWith(sponsor);
      assert.equal(JSON.stringify(transaction), expected);
    });
  });

  describe('#signWith', () => {
    it('have a valid signature', () => {
      assert.isFalse(transaction.isSigned());

      transaction.signWith(account);
      assert.isTrue(transaction.isSigned());
      assert.equal(transaction.sender, account.address);
      assert.equal(transaction.senderPublicKey, account.publicKey);
      assert.equal(transaction.senderKeyType, account.keyType);

      assert.equal(transaction.proofs.length, 1);
      assert.isTrue(account.verify(transaction.toBinary(), Binary.fromBase58(transaction.proofs[0])));

      assert.isUndefined(transaction.sponsor);
    });

    it('will automatically sponsor the tx if signed with a child account', () => {
      const child = new AccountFactoryED25519('T').createFromSeed('identifier');
      child.parent = account;

      transaction.signWith(child);
      assert.equal(transaction.sender, child.address);
      assert.equal(transaction.sponsor, account.address);

      assert.equal(2, transaction.proofs.length);
      assert.isTrue(child.verify(transaction.toBinary(), Binary.fromBase58(transaction.proofs[0])));
      assert.isTrue(account.verify(transaction.toBinary(), Binary.fromBase58(transaction.proofs[1])));
    });
  });

  describe('#from', () => {
    it('should return a transaction from the data', () => {
      const data = {
        type: 15,
        version: 3,
        sender: '3MtHYnCkd3oFZr21yb2vEdngcSGXvuNNCq2',
        senderKeyType: 'ed25519',
        senderPublicKey: '2KduZAmAKuXEL463udjCQkVfwJkBQhpciUC4gNiayjSJ',
        sponsor: '3NACnKFVN2DeFYjspHKfa2kvDqnPkhjGCD2',
        sponsorKeyType: 'ed25519',
        sponsorPublicKey: 'DriAcwPisEqtNcug2JJ2SSSDLgcrEecvmmgZgo9VZBog',
        fee: 35000000,
        timestamp: 1519862400000,
        anchors: ['328395t2pcwD3AjkYf8QzAmbyuwCR2ypLNmDVPNTHFX6'],
        proofs: [
          '33m6CrpiW5qqmPSdGeaoqQY2EsYz6Bv7iJ1Dx7YtpFuptxMYZWXnW6SQKedFsod78svj6x1Zv9BKwfQndRbozAjt',
          '3Ht3SN8yjWsBH532vFrTexMV7xNAwxEK38JUFwtKtHgFwG4qicuCvT8ZMF41TvoRm1AftzYm7jN3Gy6GHPE78RGk',
        ],
      };
      const actual = Anchor.from(data);
      assert.equal(JSON.stringify(actual), JSON.stringify(data));
    });
  });
});
