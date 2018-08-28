import { expect } from 'chai';
import { Account} from '../src/classes/Account';
import { Event } from '../src/classes/Event';
import { LTO } from '../src/LTO';
import crypto from '../src/utils/crypto';
import * as sinon from 'sinon';
import encoder from '../src/utils/encoder';

let account;
let phrase = 'satisfy sustain shiver skill betray mother appear pupil coconut weasel firm top puzzle monkey seek';

describe('Account', () => {

  beforeEach(() => {
    account = new Account();
    account.sign = {
      privateKey: encoder.decode('wJ4WH8dD88fSkNdFQRjaAhjFUZzZhV5yiDLDwNUnp6bYwRXrvWV8MJhQ9HL9uqMDG1n7XpTGZx7PafqaayQV8Rp'),
      publicKey: encoder.decode('FkU1XyfrCftc4pQKXCrrDyRLSnifX1SMvmx1CYiiyB3Y')
    };

    account.encrypt = {
      privateKey: encoder.decode('BnjFJJarge15FiqcxrB7Mzt68nseBXXR4LQ54qFBsWJN'),
      publicKey: encoder.decode('BVv1ZuE3gKFa6krwWJQwEmrLYUESuUabNCXgYTmCoBt6')
    }
  });

  describe('#testSign', () => {
    it('should generate a correct signature from a message', () => {
      const message = 'hello';
      const signature = account.signMessage(message);
      expect(signature).to.eq('2DDGtVHrX66Ae8C4shFho4AqgojCBTcE4phbCRTm3qXCKPZZ7reJBXiiwxweQAkJ3Tsz6Xd3r5qgnbA67gdL5fWE');
    });

    it('should generate a correct signature from a message with a seeded account', () => {
      const message = 'hello';
      const account = new Account(phrase);
      const signature = account.signMessage(message);
      expect(signature).to.eq('nm7MLBzamEEXzkbjJMy1B2ztRCF3VynGjZfpe1dLsSYspsMjugij4cBVgKKdRoudQMZsKxMjBMeYpJ97ZwKW7pd');
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

      expect(event.signature).to.eq('Szr7uLhwirqEuVJ9SBPuAgvFAbuiMG23FbCsVNbptLbMH7uzrR5R23Yze83YGe98HawMzjvEMWgsJhdRQDXw8Br');
    });
  });

  describe('#verify', () => {
    it('should verify a correct signature to be true', () => {
      const signature = '2DDGtVHrX66Ae8C4shFho4AqgojCBTcE4phbCRTm3qXCKPZZ7reJBXiiwxweQAkJ3Tsz6Xd3r5qgnbA67gdL5fWE';
      expect(account.verify(signature, 'hello')).to.be.true;
    });

    it('should verify a correct signature with seeded account to be true', () => {
      const account = new Account(phrase);
      const signature = 'nm7MLBzamEEXzkbjJMy1B2ztRCF3VynGjZfpe1dLsSYspsMjugij4cBVgKKdRoudQMZsKxMjBMeYpJ97ZwKW7pd';
      expect(account.verify(signature, 'hello')).to.be.true;
    });

    it('should verify an incorrect signature to be false', () => {
      const signature = '2DDGtVHrX66Ae8C4shFho4AqgojCBTcE4phbCRTm3qXCKPZZ7reJBXiiwxweQAkJ3Tsz6Xd3r5qgnbA67gdL5fWE';
      expect(account.verify(signature, 'not this')).to.be.false;
    });
  });

  describe('#encryptFor', () => {
    it('should encrypt a message for a specific account', () => {
      const recipient = new Account();
      recipient.sign = {
        privateKey: encoder.decode('pLX2GgWzkjiiPp2SsowyyHZKrF4thkq1oDLD7tqBpYDwfMvRsPANMutwRvTVZHrw8VzsKjiN8EfdGA9M84smoEz'),
        publicKey: encoder.decode('BvEdG3ATxtmkbCVj9k2yvh3s6ooktBoSmyp8xwDqCQHp')
      };

      recipient.encrypt = {
        privateKey: encoder.decode('3kMEhU5z3v8bmer1ERFUUhW58Dtuhyo9hE5vrhjqAWYT'),
        publicKey: encoder.decode('HBqhfdFASRQ5eBBpu2y6c6KKi1az6bMx8v1JxX4iW1Q8')
      };

      const getNonce = sinon.stub(Account.prototype, 'getNonce').returns((new Uint8Array(24)).fill(0));

      const cypherText = account.encryptFor(recipient, 'hello');
      expect(encoder.encode(cypherText)).to.eq('3NQBM8qd7nbLjABMf65jdExWt3xSAtAW2Sonjc7ZTLyqWAvDgiJNq7tW1XFX5H');

      getNonce.restore();
    });
  });

  describe('#decryptFrom', () => {
    it('should decrypt a message from a specific account', () => {
      const recipient = new Account();
      recipient.sign = {
        privateKey: encoder.decode('pLX2GgWzkjiiPp2SsowyyHZKrF4thkq1oDLD7tqBpYDwfMvRsPANMutwRvTVZHrw8VzsKjiN8EfdGA9M84smoEz'),
        publicKey: encoder.decode('BvEdG3ATxtmkbCVj9k2yvh3s6ooktBoSmyp8xwDqCQHp')
      };

      recipient.encrypt = {
        privateKey: encoder.decode('3kMEhU5z3v8bmer1ERFUUhW58Dtuhyo9hE5vrhjqAWYT'),
        publicKey: encoder.decode('HBqhfdFASRQ5eBBpu2y6c6KKi1az6bMx8v1JxX4iW1Q8')
      };

      const getNonce = sinon.stub(Account.prototype, 'getNonce').returns((new Uint8Array(24)).fill(0));

      const cypherText = encoder.decode('3NQBM8qd7nbLjABMf65jdExWt3xSAtAW2Sonjc7ZTLyqWAvDgiJNq7tW1XFX5H');
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
      expect(ec.id).to.eq('2bGCW3XbfLmSRhotYzcUgqiomiiFLSXKDU43jLMNaf29UXTkpkn2PfvyZkF8yx');
    });
  });

  describe('#encryptSeed', () => {
    it('should generate a cypher text from seed phrase', () => {
      const account = new Account(phrase);
      const password = 'secretpassword';

      const encryptedPhrase = account.encryptSeed(password);

      const lto = new LTO();
      const decryptedPhrase = lto.decryptSeedPhrase(encryptedPhrase, password);
      expect(decryptedPhrase).to.eq(phrase);
    })
  })
});