// noinspection DuplicatedCode

import { assert, expect } from 'chai';
import { IdentityBuilder, VerificationRelationship as VR } from '../../src/identities';
import { AccountFactoryED25519 as AccountFactory } from '../../src/accounts';
import { Register, Association, Anchor } from '../../src/transactions';

const primaryPhrase =
  'satisfy sustain shiver skill betray mother appear pupil coconut weasel firm top puzzle monkey seek';
const secondaryPhrase =
  'possible cave neglect kit vague update update midnight asset obvious exclude reject seat world check';

describe('IdentityBuilder', () => {
  const account = new AccountFactory('T').createFromSeed(primaryPhrase);
  const secondaryAccount1 = new AccountFactory('T').createFromSeed(secondaryPhrase, 0);
  const secondaryAccount2 = new AccountFactory('T').createFromSeed(secondaryPhrase, 1);

  describe('addVerificationMethod', () => {
    const builder = new IdentityBuilder(account)
      .addVerificationMethod(secondaryAccount1)
      .addVerificationMethod(secondaryAccount2, VR.authentication | VR.capabilityInvocation);
    const txs = builder.transactions;

    it('should create 3 transactions', () => {
      assert.lengthOf(txs, 3);
    });

    it('should create a register transaction', () => {
      const registerTxs = txs.filter((tx) => tx.type === Register.TYPE) as Array<Register>;
      assert.lengthOf(registerTxs, 1);

      assert.equal(registerTxs[0].type, 20);
      expect(registerTxs[0].accounts).to.deep.include({ keyType: 'ed25519', publicKey: secondaryAccount1.publicKey });
      expect(registerTxs[0].accounts).to.deep.include({ keyType: 'ed25519', publicKey: secondaryAccount2.publicKey });
      assert.equal(registerTxs[0].sender, account.address);
    });

    it('should create two association transactions', () => {
      const assocTxs = txs.filter((tx) => tx.type === Association.TYPE) as Array<Association>;
      assert.lengthOf(assocTxs, 2);

      assert.equal(assocTxs[0].type, 16);
      assert.equal(assocTxs[0].associationType, VR.none);
      assert.equal(assocTxs[0].recipient, secondaryAccount1.address);
      assert.equal(assocTxs[0].sender, account.address);

      assert.equal(assocTxs[1].type, 16);
      assert.equal(assocTxs[1].associationType, VR.authentication | VR.capabilityInvocation);
      assert.equal(assocTxs[1].recipient, secondaryAccount2.address);
      assert.equal(assocTxs[1].sender, account.address);
    });
  });

  describe('addVerificationMethod with named relationships', () => {
    const builder = new IdentityBuilder(account)
      .addVerificationMethod(secondaryAccount1, ['assertion'])
      .addVerificationMethod(secondaryAccount2, ['authentication', 'capabilityInvocation']);
    const txs = builder.transactions;

    it('should create two association transactions', () => {
      const assocTxs = txs.filter((tx) => tx.type === Association.TYPE) as Array<Association>;
      assert.lengthOf(assocTxs, 2);

      assert.equal(assocTxs[0].type, 16);
      assert.equal(assocTxs[0].associationType, VR.assertion);
      assert.equal(assocTxs[0].recipient, secondaryAccount1.address);
      assert.equal(assocTxs[0].sender, account.address);

      assert.equal(assocTxs[1].type, 16);
      assert.equal(assocTxs[1].associationType, VR.authentication | VR.capabilityInvocation);
      assert.equal(assocTxs[1].recipient, secondaryAccount2.address);
      assert.equal(assocTxs[1].sender, account.address);
    });
  });

  describe('no additional verification methods', () => {
    const txs = new IdentityBuilder(account).transactions;

    it('should create 1 transaction', () => {
      assert.lengthOf(txs, 1);
    });

    it('should create an anchor transaction', () => {
      const anchorTx = txs[0] as Anchor;

      assert.equal(anchorTx.type, Anchor.TYPE);
      assert.equal(anchorTx.sender, account.address);
    });
  });
});
