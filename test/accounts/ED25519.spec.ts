import { expect } from 'chai';
import { Account, AccountFactoryED25519, AccountFactoryECDSA } from '../../src/accounts'
import { Event } from '../../src/events/Event';
import { LTO } from '../../src/LTO';
import crypto from '../../src/utils/crypto';
import * as sinon from 'sinon';
import { decode } from '../../src/utils/encoder';

const phrase = 'satisfy sustain shiver skill betray mother appear pupil coconut weasel firm top puzzle monkey seek';
const message = 'hello'

describe('Account', () => { 
  let account;

  beforeEach(() => {
    account = new AccountFactoryED25519('T').createFromSeed(phrase);

    account.encrypt = {
      privateKey: decode('BnjFJJarge15FiqcxrB7Mzt68nseBXXR4LQ54qFBsWJN'),
      publicKey: decode('BVv1ZuE3gKFa6krwWJQwEmrLYUESuUabNCXgYTmCoBt6')
    }
  });

  describe.skip('#getEncodedSeed', () => {
    it('should return a correct base58 encoded phrase', () => {
      account.seed = phrase;
      const encodedPhrase = account.getEncodedSeed();
      expect(encodedPhrase).to.eq('EMJxAXyrymyGv1fjRyx9uptWC3Ck5AXxtZbXXv59iDjmV2rQsLmbMmw5DBf1GrjhP9VbE7Dy8wa8VstVnJsXiCDBjJhvUVhyE1wnwA1h9Hdg3wg1V6JFJfszZJ4SxYSuNLQven');
    })
  });

  describe('#testSign', () => {
    it('should generate a correct signature from a message', () => {
      const message = 'hello';
      const signature = account.Sign(message);
      expect(signature).to.eq('2cV7eF62xNPcmaNt42UK1FBhpMXtsbdFqxF2EhkGadHEEUHAbaFqYURUNms4Gzgeb9PHPytASATb3iFKWqVuAJXi');
    });

    it('should generate a correct signature from a message with a seeded account', () => {
      const message = 'hello';
      const account = new AccountFactoryED25519('T').createFromSeed(phrase);
      const signature = account.Sign(message);
      expect(signature).to.eq('2SPPcJzvJHTNJWjzWLWDaaiZap61L5EwhPY9fRjLTqGebDuqoCuqGCVTTQVyAiMAeffuNXbR8oBNRdauSr63quhn');
    });
  });

  describe('#signEvent', () => {
    it('should create a correct signature for an event', () => {
      const event = new Event();
      const getMessage = sinon.stub(Event.prototype, 'getMessage').returns([
          "HeFMDcuveZQYtBePVUugLyWtsiwsW4xp7xKdv",
          '2018-03-01T00:00:00+00:00',
          "72gRWx4C1Egqz9xvUBCYVdgh7uLc5kmGbjXFhiknNCTW",
          "FkU1XyfrCftc4pQKXCrrDyRLSnifX1SMvmx1CYiiyB3Y"
        ].join('\n'));

      const stub = sinon.stub(Event.prototype, 'getHash').returns('47FmxvJ4v1Bnk4SGSwrHcncX5t5u3eAjmc6QJgbR5nn8');
      account.signEvent(event);

      getMessage.restore();
      stub.restore();

      expect(event.signature).to.eq('28z4Q2wDR6YRxskng8y8FyoYyTZkhDtcTA6vmFXyQnbfet9FN2emK6nMB464N7VyC1czafxxKT3UCjybUdpJmV6j');
    });
  });

  describe('#verify', () => {
    it('should verify a correct signature to be true', () => {
      const signature = '2cV7eF62xNPcmaNt42UK1FBhpMXtsbdFqxF2EhkGadHEEUHAbaFqYURUNms4Gzgeb9PHPytASATb3iFKWqVuAJXi';
      expect(account.Verify(signature, message)).to.be.true;
    });


    it('should verify an incorrect signature to be false', () => {
      const signature = '2DDGtVHrX66Ae8C4shFho4AqgojCBTcE4phbCRTm3qXCKPZZ7reJBXiiwxweQAkJ3Tsz6Xd3r5qgnbA67gdL5fWE';
      expect(account.Verify(signature, 'not this')).to.be.false;
    });
  });

  describe('#Test Sign and Verify for ecdsa account', () => {
    const privKey: string = '7poBZFLzoHLX3j8C4n6dzmZWPQGB7Ypu2KRfbBCk3jWa';
    const ECDSAAccount = new AccountFactoryECDSA('T').createFromPrivateKey(privKey);
    let signature: string = "5MjdjWHmD5GSACfHKiqyryYNeLN1m9jmaEummYdMAnQrG4KT6ubGqeFzDjeporb3s2niz1MNdER9Ed2f4Apk8S8K";

    it('signs a message', () => {
      const signature = ECDSAAccount.Sign(message);
    });

    it('verify a signature of a message', () => {
        expect(ECDSAAccount.Verify(signature, message)).to.be.true;
    });
});

  describe.skip('#encryptFor', () => {
    it('should encrypt a message for a specific account', () => {
      const recipient = new AccountFactoryED25519('T').create();
      recipient.sign = {
        privateKey: decode('pLX2GgWzkjiiPp2SsowyyHZKrF4thkq1oDLD7tqBpYDwfMvRsPANMutwRvTVZHrw8VzsKjiN8EfdGA9M84smoEz'),
        publicKey: decode('BvEdG3ATxtmkbCVj9k2yvh3s6ooktBoSmyp8xwDqCQHp')
      };

      recipient.encrypt = {
        privateKey: decode('3kMEhU5z3v8bmer1ERFUUhW58Dtuhyo9hE5vrhjqAWYT'),
        publicKey: decode('HBqhfdFASRQ5eBBpu2y6c6KKi1az6bMx8v1JxX4iW1Q8')
      };

      const getNonce = sinon.stub(Account.prototype, 'getNonce').returns((new Uint8Array(24)).fill(0));

      const cypherText = account.encryptFor(recipient, 'hello');
      expect(encoder.encode(cypherText)).to.eq('3NQBM8qd7nbLjABMf65jdExWt3xSAtAW2Sonjc7ZTLyqWAvDgiJNq7tW1XFX5H');

      getNonce.restore();
    });
  });

  describe.skip('#decryptFrom', () => {
    it('should decrypt a message from a specific account', () => {
      const recipient = new AccountFactoryED25519('T').create();

      recipient.sign = {
        privateKey: decode('pLX2GgWzkjiiPp2SsowyyHZKrF4thkq1oDLD7tqBpYDwfMvRsPANMutwRvTVZHrw8VzsKjiN8EfdGA9M84smoEz'),
        publicKey: decode('BvEdG3ATxtmkbCVj9k2yvh3s6ooktBoSmyp8xwDqCQHp')
      };

      recipient.encrypt = {
        privateKey: decode('3kMEhU5z3v8bmer1ERFUUhW58Dtuhyo9hE5vrhjqAWYT'),
        publicKey: decode('HBqhfdFASRQ5eBBpu2y6c6KKi1az6bMx8v1JxX4iW1Q8')
      };

      const getNonce = sinon.stub(Account.prototype, 'getNonce').returns((new Uint8Array(24)).fill(0));

      const cypherText = decode('3NQBM8qd7nbLjABMf65jdExWt3xSAtAW2Sonjc7ZTLyqWAvDgiJNq7tW1XFX5H');
      const message = recipient.decryptFrom(account, cypherText);

      expect(message).to.eq('hello');
      getNonce.restore();
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
