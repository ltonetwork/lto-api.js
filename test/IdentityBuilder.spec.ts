import { IAnchorTransaction, IAssociationTransaction, ITransferTransaction } from '@lto-network/lto-transactions';
import { expect } from 'chai';
import { Account } from '../src/classes/Account';
import { IdentityBuilder } from '../src/classes/IdentityBuilder';

let primaryAccount;
let secondaryAccount;
const primaryPhrase = 'satisfy sustain shiver skill betray mother appear pupil coconut weasel firm top puzzle monkey seek';
const secondaryPhrase = 'possible cave neglect kit vague update update midnight asset obvious exclude reject seat world check';

describe('Identity', () => {
  beforeEach(() => {
    primaryAccount = new Account(primaryPhrase);
    secondaryAccount = new Account(secondaryPhrase);
  });

  describe('#addVerificationMethod', () => {
    it('should create the transactions for adding a verification method', () => {
      const identity = new IdentityBuilder(primaryAccount);

      identity.addVerificationMethod(secondaryAccount, 'authentication');

      const transferTx = identity.transactions[0] as ITransferTransaction;

      expect(transferTx).to.contain({
        type: 4,
        amount: 35000000,
        recipient: '3JkgdYoJpxdoFpyoLsqa1GUSA7ouhmqEowV',
        senderPublicKey: '3ct1eeZg1ryzz24VHk4CigJxW6Adxh7Syfm459CmGNv2'
      });

      const anchorTx = identity.transactions[1] as IAnchorTransaction;

      expect(anchorTx.anchors).to.contain('oooooooooooooooooooooooooooooooooooooooooooo');
      expect(anchorTx).to.contain({
        type: 15,
        senderPublicKey: 'HZ5gzkB8jZSHj8NN4oNEh9PAhvScioepvAun2ZiEbbfS'
      });

      const associationTx = identity.transactions[2] as IAssociationTransaction;

      expect(associationTx).to.contain({
        type: 16,
        associationType: 'authentication',
        party: '3JkgdYoJpxdoFpyoLsqa1GUSA7ouhmqEowV',
        sender: '3JtiLvHGDaFbE6MGzQMCcNtXqpyDgDEopMq',
        senderPublicKey: '3ct1eeZg1ryzz24VHk4CigJxW6Adxh7Syfm459CmGNv2',
      });
    });
  });
});