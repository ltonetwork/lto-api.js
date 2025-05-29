// noinspection DuplicatedCode

import { assert, expect } from 'chai';
import { Account, AccountFactoryECDSA } from '../../src/accounts';
import { DEFAULT_DERIVATION_PATH } from '../../src/constants';
import { Binary } from '../../src';

describe('secp256k1 account', () => {
  const seed = 'satisfy sustain shiver skill betray mother appear pupil coconut weasel firm top puzzle monkey seek';
  const otherSeed =
    'library ride board swallow route salmon country love luggage beyond all attract crunch burger field';

  const privKey = 'DRpStYEzVkHs8WRGz9zcxRoudhnYzeGzJ6JVVWFcrbsA';
  const pubKey = 'yBUTnq2bLomxJSrQTMgD9CLKLLzKxZCMTH2naizoBpcZ';
  const message = 'hello';

  const factory = new AccountFactoryECDSA('T', 'secp256k1');
  const account = factory.createFromSeed(seed);
  const other = factory.createFromSeed(otherSeed);

  describe('random', () => {
    let account: Account;

    before(() => {
      account = factory.create();
    });

    it('is an secp256k1 account', () => {
      assert.equal(account.keyType, 'secp256k1');
      assert.lengthOf(account.signKey.privateKey!, 32);
      assert.lengthOf(account.signKey.publicKey, 33);
    });

    it('can sign an verify a message', () => {
      const signature = account.sign(message);
      assert(account.verify(message, signature));
    });
  });

  describe('random with a derivation path', () => {
    let account: Account;

    before(() => {
      account = factory.createFromSeed('', new Binary(`m/44'/60'/0'/0`));
    });

    it('is an secp256k1 account', () => {
      assert.equal(account.keyType, 'secp256k1');
      assert.lengthOf(account.seed!.split(' '), 12);
      assert.equal(account.nonce.toString(), `m/44'/60'/0'/0`);
      assert.lengthOf(account.signKey!.privateKey!, 32);
      assert.lengthOf(account.signKey!.publicKey!, 33);
    });
  });

  describe('from seed', () => {
    it('has the correct seed, private key and public key', () => {
      assert.equal(account.keyType, 'secp256k1');
      assert.equal(account.seed, seed);
      assert.equal(account.nonce.toString(), DEFAULT_DERIVATION_PATH);
      assert.equal(account.signKey.privateKey!.base58, privKey);
      assert.equal(account.signKey.publicKey!.base58, pubKey);
    });

    it('can sign an verify a message', () => {
      const signature = account.sign(message);
      assert(account.verify(message, signature));
    });
  });

  describe('from private key', () => {
    let account: Account;

    before(() => {
      account = factory.createFromPrivateKey(privKey);
    });

    it('has the correct private and public key', () => {
      assert.equal(account.keyType, 'secp256k1');
      assert.equal(account.signKey.privateKey!.base58, privKey);
      assert.equal(account.signKey.publicKey!.base58, pubKey);
    });

    it('can sign an verify a message', () => {
      const signature = account.sign(message);
      assert(account.verify(message, signature));
    });
  });

  describe('from public key', () => {
    let account: Account;

    before(() => {
      account = factory.createFromPublicKey(pubKey);
    });

    it('has the correct public key', () => {
      assert.equal(account.keyType, 'secp256k1');
      assert.equal(account.signKey.publicKey.base58, pubKey);
    });
  });

  describe('encrypt and decrypt message', () => {
    it('should decrypt the message with the correct account', () => {
      const cypherText = account.encrypt('hello');
      const message = account.decrypt(cypherText);
      assert.equal(message.toString(), 'hello');
    });

    it('should not decrypt the message with a different account', () => {
      const cypherText = account.encrypt('hello');
      expect(() => other.decrypt(cypherText)).to.throw('Unable to decrypt message with given keys');
    });
  });
});
