import { expect } from 'chai';
import { AccountFactoryED25519 } from '../../src/accounts'
import { LTO } from '../../src';
import * as crypto from '../../src/utils/crypto';
import { encode, decode } from '../../src/utils/encoder';
import Binary from "../../src/Binary";

const phrase = 'satisfy sustain shiver skill betray mother appear pupil coconut weasel firm top puzzle monkey seek';
const message = 'hello'

describe('ed25519 account', () => {
  const account = new AccountFactoryED25519('T').createFromSeed(phrase);

  describe.skip('#getEncodedSeed', () => {
    it('should return a correct base58 encoded phrase', () => {
      const encodedPhrase = account.getEncodedSeed();
      expect(encodedPhrase).to.eq('EMJxAXyrymyGv1fjRyx9uptWC3Ck5AXxtZbXXv59iDjmV2rQsLmbMmw5DBf1GrjhP9VbE7Dy8wa8VstVnJsXiCDBjJhvUVhyE1wnwA1h9Hdg3wg1V6JFJfszZJ4SxYSuNLQven');
    })
  });

  describe('#testSign', () => {
    it('should generate a correct signature from a message', () => {
      const message = 'hello';
      const signature = account.sign(message);
      expect(signature.base58).to.eq('2cV7eF62xNPcmaNt42UK1FBhpMXtsbdFqxF2EhkGadHEEUHAbaFqYURUNms4Gzgeb9PHPytASATb3iFKWqVuAJXi');
    });

    it('should generate a correct signature from a message with a seeded account', () => {
      const message = 'hello';
      const account = new AccountFactoryED25519('T').createFromSeed(phrase);
      const signature = account.sign(message);
      expect(signature.base58).to.eq('2SPPcJzvJHTNJWjzWLWDaaiZap61L5EwhPY9fRjLTqGebDuqoCuqGCVTTQVyAiMAeffuNXbR8oBNRdauSr63quhn');
    });
  });

  describe('#verify', () => {
    it('should verify a correct signature to be true', () => {
      const signature = '2cV7eF62xNPcmaNt42UK1FBhpMXtsbdFqxF2EhkGadHEEUHAbaFqYURUNms4Gzgeb9PHPytASATb3iFKWqVuAJXi';
      expect(account.verify(message, Binary.fromBase58(signature))).to.be.true;
    });


    it('should verify an incorrect signature to be false', () => {
      const signature = '2DDGtVHrX66Ae8C4shFho4AqgojCBTcE4phbCRTm3qXCKPZZ7reJBXiiwxweQAkJ3Tsz6Xd3r5qgnbA67gdL5fWE';
      expect(account.verify('not this', Binary.fromBase58(signature))).to.be.false;
    });
  });

  describe.skip('#encryptFor', () => {
    it('should encrypt a message for a specific account', () => {
      const recipient = new AccountFactoryED25519('T').createFromPrivateKey(
          'pLX2GgWzkjiiPp2SsowyyHZKrF4thkq1oDLD7tqBpYDwfMvRsPANMutwRvTVZHrw8VzsKjiN8EfdGA9M84smoEz'
      );

      const cypherText = account.encryptFor(recipient, 'hello');
      expect(cypherText.base58).to.eq('3NQBM8qd7nbLjABMf65jdExWt3xSAtAW2Sonjc7ZTLyqWAvDgiJNq7tW1XFX5H');
    });
  });

  describe.skip('#decryptFrom', () => {
    it('should decrypt a message from a specific account', () => {
      const recipient = new AccountFactoryED25519('T').createFromPrivateKey(
          'pLX2GgWzkjiiPp2SsowyyHZKrF4thkq1oDLD7tqBpYDwfMvRsPANMutwRvTVZHrw8VzsKjiN8EfdGA9M84smoEz'
      );

      const cypherText = decode('3NQBM8qd7nbLjABMf65jdExWt3xSAtAW2Sonjc7ZTLyqWAvDgiJNq7tW1XFX5H');
      const message = recipient.decryptFrom(account, cypherText);

      expect(message.asString()).to.eq('hello');
    });
  });

  describe('#createEventChain', () => {
    it('should create an account with a random seed', () => {
      const ec = account.createEventChain();
      expect(crypto.verifyEventId(ec.id)).to.be.true;
    });

    it('should create an account with a predefined seed', () => {
      const nonce = '10';

      const ec = account.createEventChain(nonce);
      expect(ec.id).to.eq('2bGCW3XbfLmSRhotYzcUgqiomiiFLVdGJsHhFVThz4vL6SyRRoedoCS5CcBfkR');
    });
  });

  describe('#encryptSeed', () => {
    it('should generate a cypher text from seed phrase', () => {
      const account = new AccountFactoryED25519('T').createFromSeed(phrase);
      const password = 'secretpassword';

      const encryptedPhrase = account.encryptSeed(password);

      const lto = new LTO();
      const decryptedPhrase = lto.decryptSeedPhrase(encryptedPhrase, password);
      expect(decryptedPhrase).to.eq(phrase);
    })
  })
});
