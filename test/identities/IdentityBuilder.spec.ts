// noinspection DuplicatedCode

import { assert, expect } from 'chai';
import { IdentityBuilder } from '../../src/identities/index.js';
import { AccountFactoryED25519 as AccountFactory } from '../../src/accounts/index.js';
import { Register, Association, Anchor, Statement } from '../../src/transactions/index.js';
import { Data, RevokeAssociation } from '../../src';
import DataEntry from '../../src/transactions/index.js/DataEntry';
import {
  ASSOCIATION_TYPE_DID_DISABLE_CAPABILITY,
  ASSOCIATION_TYPE_DID_VERIFICATION_METHOD,
  STATEMENT_TYPE_DEACTIVATE_DID,
} from '../../src/constants';

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
      .addVerificationMethod(secondaryAccount1, [], new Date('2030-01-01T00:00:00.000Z'))
      .addVerificationMethod(secondaryAccount2, ['authentication', 'capabilityInvocation']);
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

      const tx1: Association = assocTxs[0];
      assert.equal(tx1.type, Association.TYPE);
      assert.equal(tx1.associationType, ASSOCIATION_TYPE_DID_VERIFICATION_METHOD);
      assert.equal(tx1.recipient, secondaryAccount1.address);
      assert.equal(tx1.sender, account.address);
      assert.equal(tx1.expires, new Date('2030-01-01T00:00:00.000Z').getTime());

      const tx2: Association = assocTxs[1];
      assert.equal(tx2.type, Association.TYPE);
      assert.equal(tx2.associationType, ASSOCIATION_TYPE_DID_VERIFICATION_METHOD);
      assert.equal(tx2.recipient, secondaryAccount2.address);
      assert.equal(tx2.sender, account.address);
      assert.isUndefined(tx2.expires);
      assert.deepInclude(tx2.data, { key: 'authentication', type: 'boolean', value: true } as DataEntry);
      assert.deepInclude(tx2.data, { key: 'capabilityInvocation', type: 'boolean', value: true } as DataEntry);
    });
  });

  describe('removeVerificationMethod', () => {
    const builder = new IdentityBuilder(account)
      .removeVerificationMethod(secondaryAccount1)
      .removeVerificationMethod(`${secondaryAccount2.did}#sign`);
    const txs = builder.transactions;

    it('should create two revoke association transactions', () => {
      assert.lengthOf(txs, 2);
      assert.equal(txs[0].type, RevokeAssociation.TYPE);

      const tx1 = txs[0] as RevokeAssociation;
      assert.equal(tx1.associationType, ASSOCIATION_TYPE_DID_VERIFICATION_METHOD);
      assert.equal(tx1.recipient, secondaryAccount1.address);
      assert.equal(tx1.sender, account.address);

      const tx2 = txs[1] as RevokeAssociation;
      assert.equal(tx2.associationType, ASSOCIATION_TYPE_DID_VERIFICATION_METHOD);
      assert.equal(tx2.recipient, secondaryAccount2.address);
      assert.equal(tx2.sender, account.address);
    });
  });

  describe('grantDisableCapability', () => {
    const builder = new IdentityBuilder(account)
      .grantDisableCapability(secondaryAccount1, new Date('2030-01-01T00:00:00.000Z'))
      .grantDisableCapability(secondaryAccount2.did, undefined, 86400000);
    const txs = builder.transactions;

    it('should create two association transactions', () => {
      assert.lengthOf(txs, 2);

      const tx1 = txs[0] as Association;
      assert.equal(tx1.type, Association.TYPE);
      assert.equal(tx1.associationType, ASSOCIATION_TYPE_DID_DISABLE_CAPABILITY);
      assert.equal(tx1.recipient, secondaryAccount1.address);
      assert.equal(tx1.sender, account.address);
      assert.equal(tx1.expires, new Date('2030-01-01T00:00:00.000Z').getTime());
      assert.equal(tx1.data.length, 0);

      const tx2 = txs[1] as Association;
      assert.equal(tx2.type, Association.TYPE);
      assert.equal(tx2.associationType, ASSOCIATION_TYPE_DID_DISABLE_CAPABILITY);
      assert.equal(tx2.recipient, secondaryAccount2.address);
      assert.equal(tx2.sender, account.address);
      assert.isUndefined(tx2.expires);
      assert.equal(tx2.data.length, 1);
      assert.deepInclude(tx2.data, { key: 'revokeDelay', type: 'integer', value: 86400000 } as DataEntry);
    });
  });

  describe('revokeDisableCapability', () => {
    const builder = new IdentityBuilder(account)
      .revokeDisableCapability(secondaryAccount1)
      .revokeDisableCapability(secondaryAccount2.did);
    const txs = builder.transactions;

    it('should create two revoke association transactions', () => {
      assert.lengthOf(txs, 2);
      assert.equal(txs[0].type, RevokeAssociation.TYPE);

      const tx1 = txs[0] as RevokeAssociation;
      assert.equal(tx1.associationType, ASSOCIATION_TYPE_DID_DISABLE_CAPABILITY);
      assert.equal(tx1.recipient, secondaryAccount1.address);
      assert.equal(tx1.sender, account.address);

      const tx2 = txs[1] as RevokeAssociation;
      assert.equal(tx2.associationType, ASSOCIATION_TYPE_DID_DISABLE_CAPABILITY);
      assert.equal(tx2.recipient, secondaryAccount2.address);
      assert.equal(tx2.sender, account.address);
    });
  });

  describe('addService', () => {
    const builder = new IdentityBuilder(account)
      .addService({ type: 'LTORelay', serviceEndpoint: 'ampq://example.com' })
      .addService({ id: `${account.did}#abcdef`, type: 'bar', serviceEndpoint: 'https://example.com/bar' })
      .addService({
        id: `id:123`,
        type: 'qux',
        serviceEndpoint: 'https://example.com/qux',
        description: 'QUX',
      });
    const txs = builder.transactions;

    it('should create one data transaction', () => {
      assert.lengthOf(txs, 1);
      assert.equal(txs[0].type, Data.TYPE);
    });

    it('should have the correct data entries', () => {
      const tx = txs[0] as Data;

      const entries = tx.data.map((entry) => {
        return {
          key: entry.key,
          type: entry.type,
          value: typeof entry.value === 'string' ? JSON.parse(entry.value) : entry.value,
        };
      });

      assert.deepInclude(entries, {
        key: `did:service:lto-relay`,
        type: 'string',
        value: { type: 'LTORelay', serviceEndpoint: 'ampq://example.com' },
      });

      assert.deepInclude(entries, {
        key: `did:service:abcdef`,
        type: 'string',
        value: { id: `${account.did}#abcdef`, type: 'bar', serviceEndpoint: 'https://example.com/bar' },
      });

      assert.deepInclude(entries, {
        key: `did:service:id:123`,
        type: 'string',
        value: { id: 'id:123', type: 'qux', serviceEndpoint: 'https://example.com/qux', description: 'QUX' },
      });
    });
  });

  describe('removeService', () => {
    const builder = new IdentityBuilder(account)
      .addService({ type: 'foo', serviceEndpoint: 'https://example.com/foo' })
      .removeService(`${account.did}#abcdef`)
      .removeService('id:123');
    const txs = builder.transactions;

    it('should create one data transaction', () => {
      assert.lengthOf(txs, 1);
      assert.equal(txs[0].type, Data.TYPE);
    });

    it('should have the correct data entries', () => {
      const tx = txs[0] as Data;

      const entries = tx.data.map((entry) => {
        return {
          key: entry.key,
          type: entry.type,
          value: typeof entry.value === 'string' ? JSON.parse(entry.value) : entry.value,
        };
      });

      assert.deepInclude(entries, {
        key: `did:service:foo`,
        type: 'string',
        value: { type: 'foo', serviceEndpoint: 'https://example.com/foo' },
      });

      assert.deepInclude(entries, {
        key: `did:service:abcdef`,
        type: 'boolean',
        value: false,
      });

      assert.deepInclude(entries, {
        key: `did:service:id:123`,
        type: 'boolean',
        value: false,
      });
    });
  });

  describe('no additional verification methods or services', () => {
    const builder = new IdentityBuilder(account);
    const txs = builder.transactions;

    it('should create 1 transaction', () => {
      assert.lengthOf(txs, 1);
    });

    it('should create an empty anchor transaction', () => {
      const anchorTx = txs[0] as Anchor;

      assert.equal(anchorTx.type, Anchor.TYPE);
      assert.equal(anchorTx.sender, account.address);
      assert.lengthOf(anchorTx.anchors, 0);
    });
  });

  describe('revoke', () => {
    const builder = new IdentityBuilder(account);

    it('should create a statement transaction', () => {
      const tx = builder.deactivate();

      assert.equal(tx.type, Statement.TYPE);
      assert.equal(tx.sender, account.address);
      assert.equal(tx.statementType, STATEMENT_TYPE_DEACTIVATE_DID);
    });

    it('should create a statement transaction with a reason', () => {
      const tx = builder.deactivate('reason');

      assert.equal(tx.type, Statement.TYPE);
      assert.equal(tx.sender, account.address);
      assert.equal(tx.statementType, STATEMENT_TYPE_DEACTIVATE_DID);
      assert.deepInclude(tx.data, { key: 'reason', type: 'string', value: 'reason' } as DataEntry);
    });
  });
});
