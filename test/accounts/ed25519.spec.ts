import { assert, expect } from 'chai';
import { AccountFactoryED25519 } from '../../src/accounts'
import * as crypto from '../../src/utils/crypto';
import Binary from "../../src/Binary";
import DecryptError from "../../src/errors/DecryptError";

describe('ed25519 account', () => {
  const phrase = 'satisfy sustain shiver skill betray mother appear pupil coconut weasel firm top puzzle monkey seek';

  const factory = new AccountFactoryED25519('T');
  const account = factory.createFromSeed(phrase);
  const recipient = factory.createFromPrivateKey(
      'pLX2GgWzkjiiPp2SsowyyHZKrF4thkq1oDLD7tqBpYDwfMvRsPANMutwRvTVZHrw8VzsKjiN8EfdGA9M84smoEz'
  );
  const other = factory.createFromSeed('other')

  describe.skip('#getEncodedSeed', () => {
    it('should return a correct base58 encoded phrase', () => {
      const encodedPhrase = account.encodeSeed();
      expect(encodedPhrase).to.eq('EMJxAXyrymyGv1fjRyx9uptWC3Ck5AXxtZbXXv59iDjmV2rQsLmbMmw5DBf1GrjhP9VbE7Dy8wa8VstVnJsXiCDBjJhvUVhyE1wnwA1h9Hdg3wg1V6JFJfszZJ4SxYSuNLQven');
    })
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
  });

  describe.skip('encrypt and decrypt', () => {
    let cypherText: Binary;

    before(() => {
      cypherText = account.encryptFor(recipient, 'hello');
    });

    it('should decrypt the message with the correct account', () => {
      const message = recipient.decryptFrom(account, cypherText);
      assert.equal(message.toString(), 'hello');
    });

    it('should not decrypt the message with a different account', () => {
      expect(other.decryptFrom.bind(other, cypherText))
          .to.throw(new DecryptError('Unable to decrypt message with given keys'));
    })
  });

  describe('#createEventChain', () => {
    it('should create an account with a random seed', () => {
      const ec = account.createEventChain();
      expect(crypto.verifyEventId(ec.id)).to.be.true;
    });

    it('should create an account with a predefined seed', () => {
      const nonce = '10';

      const ec = account.createEventChain(nonce);
      expect(ec.id).to.eq('2bGCW3XbfLmSRhotYzcUgqiomiiFL7y3h7xPH8Ha3FVaYFp6YsjzSRSBeVjnae');
    });
  });
});
