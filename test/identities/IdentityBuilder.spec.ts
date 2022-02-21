import {assert, expect} from 'chai';
import {IdentityBuilder} from '../../src/identities';
import {AccountFactoryED25519 as AccountFactory} from '../../src/accounts';
import {Register, Association, Anchor} from "../../src/transactions";

const primaryPhrase = 'satisfy sustain shiver skill betray mother appear pupil coconut weasel firm top puzzle monkey seek';
const secondaryPhrase = 'possible cave neglect kit vague update update midnight asset obvious exclude reject seat world check';

describe('IdentityBuilder', () => {
    const account = new AccountFactory('T').createFromSeed(primaryPhrase);
    const secondaryAccount1 = new AccountFactory('T').createFromSeed(secondaryPhrase, 0);
    const secondaryAccount2 = new AccountFactory('T').createFromSeed(secondaryPhrase, 1);

    describe('addVerificationMethod', () => {
        const txs = new IdentityBuilder(account)
            .addVerificationMethod(secondaryAccount1, 1)
            .addVerificationMethod(secondaryAccount2, 2)
            .transactions;

        it('should create 3 transactions', () => {
            assert.lengthOf(txs, 3);
        });

        it('should create a register transaction', () => {
            const registerTx = txs[0] as Register;

            assert.equal(registerTx.type, 20);
            expect(registerTx.accounts).to.contain({keyType: 'ed25519', publicKey: secondaryAccount1.publicKey});
            expect(registerTx.accounts).to.contain({keyType: 'ed25519', publicKey: secondaryAccount2.publicKey});
            assert.equal(registerTx.sender, account.address);
        });

        it('should create a association transactions', () => {
            const assocTxs = txs.slice(1) as Array<Association>;

            assert.lengthOf(assocTxs, 2);

            assert.equal(assocTxs[0].type, 16);
            assert.equal(assocTxs[0].associationType, 1);
            assert.equal(assocTxs[0].recipient, secondaryAccount1.address);
            assert.equal(assocTxs[0].sender, account.address);

            assert.equal(assocTxs[0].type, 16);
            assert.equal(assocTxs[0].associationType, 2);
            assert.equal(assocTxs[0].recipient, secondaryAccount2.address);
            assert.equal(assocTxs[0].sender, account.address);
        });
    });

    describe('no additional verification methods', () => {
        const txs = new IdentityBuilder(account).transactions;

        it('should create 1 transaction', () => {
            assert.lengthOf(txs, 1);
        });

        it('should create an anchor transaction', () => {
            const anchorTx = txs[0] as Anchor;

            assert.equal(anchorTx.type, 20);
            assert.equal(anchorTx.sender, account.address);
        });
    })
})
