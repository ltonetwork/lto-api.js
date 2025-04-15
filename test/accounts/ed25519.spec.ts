// noinspection DuplicatedCode

import { assert, expect } from 'chai';
import { AccountFactoryED25519 } from '../../src/accounts';
import { Binary } from '../../src';
import { ED25519 } from '../../src/accounts/ed25519/ED25519';
import { decryptSeed } from '../../src/utils';

describe('ed25519 account', () => {
  const seed = 'satisfy sustain shiver skill betray mother appear pupil coconut weasel firm top puzzle monkey seek';

  const factory = new AccountFactoryED25519('T');
  const account = factory.createFromSeed(seed);
  const other = factory.createFromSeed('other');

  describe('#createFromSeed', () => {
    it('should create an account with correct sign and encrypt keys', () => {
      expect(account.address).to.equal('3N7RAo9eXFhJEdpPgbhsAFti8s1HDxxXiCW');
      expect(account.signKey.privateKey!.base58).to.equal(
        '4LqWfpGAhZoKHk2c7MAfuHrrCsvM1Yt5gtjSkKDjgZiFJvkjDRo1Efs4PxMWPuZ39QgveHzqGMCqhNZzSkKuECCW',
      );
      expect(account.signKey.publicKey.base58).to.equal('3ct1eeZg1ryzz24VHk4CigJxW6Adxh7Syfm459CmGNv2');
      expect(account.seed).to.equal(seed);
      expect(account.nonce).to.equal(0);
      expect(account.cypher).to.be.instanceOf(ED25519);
      expect(account.encryptKey.privateKey!.base58).to.equal('BH1p4LZqk8zi2ZTKq2pLrozGHKwayngZUC25FUKNgTwK');
      expect(account.encryptKey.publicKey.base58).to.equal('43UwiXnVsrXZR96euf6B1myQJ7MX2hqJyDEz6Yz7nc4q');
    });

    it('should create an account with a custom nonce', () => {
      const account = factory.createFromSeed(seed, new Uint8Array([1, 2, 3]));
      expect(account.nonce).to.deep.equal(new Uint8Array([1, 2, 3]));
    });

    it('should throw an error if seed is missing or invalid', () => {
      expect(() => factory.createFromSeed('')).to.throw('Missing or invalid seed phrase');
      expect(() => factory.createFromSeed(null as any)).to.throw('Missing or invalid seed phrase');
      expect(() => factory.createFromSeed(undefined as any)).to.throw('Missing or invalid seed phrase');
      expect(() => factory.createFromSeed(12345 as any)).to.throw('Missing or invalid seed phrase');
    });
  });

  describe('#createFromPrivateKey', () => {
    it('should create an account with correct sign and encrypt keys', () => {
      const account = factory.createFromPrivateKey(
        '4LqWfpGAhZoKHk2c7MAfuHrrCsvM1Yt5gtjSkKDjgZiFJvkjDRo1Efs4PxMWPuZ39QgveHzqGMCqhNZzSkKuECCW',
      );
      expect(account.address).to.equal('3N7RAo9eXFhJEdpPgbhsAFti8s1HDxxXiCW');
      expect(account.signKey.privateKey!.base58).to.equal(
        '4LqWfpGAhZoKHk2c7MAfuHrrCsvM1Yt5gtjSkKDjgZiFJvkjDRo1Efs4PxMWPuZ39QgveHzqGMCqhNZzSkKuECCW',
      );
      expect(account.signKey.publicKey.base58).to.equal('3ct1eeZg1ryzz24VHk4CigJxW6Adxh7Syfm459CmGNv2');
      expect(account.cypher).to.be.instanceOf(ED25519);
      expect(account.encryptKey.privateKey!.base58).to.equal('BH1p4LZqk8zi2ZTKq2pLrozGHKwayngZUC25FUKNgTwK');
      expect(account.encryptKey.publicKey.base58).to.equal('43UwiXnVsrXZR96euf6B1myQJ7MX2hqJyDEz6Yz7nc4q');
    });
  });

  describe('#createFromPublicKey', () => {
    it('should create an account with correct sign and encrypt public key', () => {
      const account = factory.createFromPublicKey('3ct1eeZg1ryzz24VHk4CigJxW6Adxh7Syfm459CmGNv2');
      expect(account.address).to.equal('3N7RAo9eXFhJEdpPgbhsAFti8s1HDxxXiCW');
      expect(account.signKey.privateKey).to.be.undefined;
      expect(account.signKey.publicKey.base58).to.equal('3ct1eeZg1ryzz24VHk4CigJxW6Adxh7Syfm459CmGNv2');
      expect(account.cypher).to.be.instanceOf(ED25519);
      expect(account.encryptKey.privateKey).to.be.undefined;
      expect(account.encryptKey.publicKey.base58).to.equal('43UwiXnVsrXZR96euf6B1myQJ7MX2hqJyDEz6Yz7nc4q');
    });
  });

  describe('#getEncryptedSeed', () => {
    it('should encrypt a seed', () => {
      const encryptedSeed = account.encryptSeed('test');
      const decryptedSeed = decryptSeed(encryptedSeed, 'test');

      expect(decryptedSeed).to.eq(seed);
    });

    it('should return a different seed when using an incorrect password', () => {
      const encryptedSeed = account.encryptSeed('test');
      const decryptedSeed = decryptSeed(encryptedSeed, 'wrong');

      expect(decryptedSeed).to.not.eq(seed);
    });
  });

  describe('sign and verify message', () => {
    let signature: Binary;

    before(() => {
      signature = account.sign('hello');
    });

    it('should verify the correct message', () => {
      assert.isTrue(account.verify('hello', signature));
    });

    it('should not verify a different message', () => {
      assert.isFalse(account.verify('bye', signature));
    });

    it('should not verify with an invalid signature', () => {
      assert.isFalse(account.verify('bye', new Binary('')));
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
