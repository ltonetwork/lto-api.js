import { expect } from 'chai';
import { Account } from '../src/accounts/Account';
import { IdentityBuilder } from '../src/identities/IdentityBuilder';
import { AccountFactoryED25519 } from '../src/accounts/ed25519/AccountFactoryED25519';
let primaryAccount;
let secondaryAccount;
const primaryPhrase = 'satisfy sustain shiver skill betray mother appear pupil coconut weasel firm top puzzle monkey seek';
const secondaryPhrase = 'possible cave neglect kit vague update update midnight asset obvious exclude reject seat world check';

describe('Identity', () => {
  beforeEach(() => {
    primaryAccount = new AccountFactoryED25519('T').createFromSeed(primaryPhrase);
    secondaryAccount = new AccountFactoryED25519('T').createFromSeed(secondaryPhrase);
  });

  describe('#addVerificationMethod', () => {
    it('should create the transactions for adding a verification method', () => {
      const identity = new IdentityBuilder(primaryAccount);

      identity.addVerificationMethod(secondaryAccount, 1);

      const transferTx = identity.transactions[0] as ITransferTransaction;

      expect(transferTx).to.contain({
        type: 4,
        amount: 35000000,
        recipient: '3MyPTRfh8e5WGNSv35CEZ9UcT9qyFPS4EXG',
        senderPublicKey: '3ct1eeZg1ryzz24VHk4CigJxW6Adxh7Syfm459CmGNv2'
      });

      const anchorTx = identity.transactions[1] as IAnchorTransaction;

      expect(anchorTx.anchors).to.contain('ooooooooooooooooooooo');
      expect(anchorTx).to.contain({
        type: 15,
        senderPublicKey: 'HZ5gzkB8jZSHj8NN4oNEh9PAhvScioepvAun2ZiEbbfS'
      });

      const associationTx = identity.transactions[2] as IAssociationTransaction;

      expect(associationTx).to.contain({
        type: 16,
        associationType: 1,
        party: '3MyPTRfh8e5WGNSv35CEZ9UcT9qyFPS4EXG',
        sender: '3N7RAo9eXFhJEdpPgbhsAFti8s1HDxxXiCW',
        senderPublicKey: '3ct1eeZg1ryzz24VHk4CigJxW6Adxh7Syfm459CmGNv2',
      });
    });

    it('should create transactions for adding multiple verification methods', () => {
      const identity = new IdentityBuilder(primaryAccount);

      identity.addVerificationMethod(secondaryAccount, 1);
      identity.addVerificationMethod(secondaryAccount, 2);
      identity.addVerificationMethod(secondaryAccount, 3);

      expect(identity.transactions.length).to.eq(9);
    });
  });
});
