import {assert} from 'chai';
import {Account, AccountFactoryECDSA} from '../../src/accounts';
import Binary from "../../src/Binary";

describe('secp256k1 account', () => {
    const seed = 'test';
    const nonce = 2;
    const privKey = '7poBZFLzoHLX3j8C4n6dzmZWPQGB7Ypu2KRfbBCk3jWa';
    const pubKey = 'vcHtjj77tE1QFSe3t7cjvWae7tVR4NuLPudkakVZtdRs';
    const message = 'hello';
    const signature = Binary.fromBase58(''); // TODO

    const factory = new AccountFactoryECDSA('T', 'secp256k1');

    describe('random', () => {
        let account: Account;

        before(() => {
            account = factory.create();
        });

        it('is an secp256k1 account', () => {
            assert.equal(account.keyType, 'secp256k1');
            assert.lengthOf(account.signKeys.privateKey, 32);
            assert.lengthOf(account.signKeys.publicKey, 33);
        });

        it('can sign an verify a message', () => {
            const signature = account.sign(message);
            assert(account.verify(message, signature));
        });
    });

    describe.skip('from seed', () => {
        let account: Account;

        before(() => {
            account = factory.createFromSeed(seed, 2);
        });

        it('has the correct seed, private key and public key', () => {
            assert.equal(account.keyType, 'secp256k1');
            assert.equal(account.seed, seed);
            assert.equal(account.nonce, nonce);
            assert.equal(account.signKeys.privateKey.base58, privKey);
            assert.equal(account.signKeys.publicKey.base58, pubKey);
        });

        it('can sign an verify a message', () => {
            const signature = account.sign(message);
            assert(account.verify(message, signature));
        });
    });

    describe('from private key', () => {
        let account: Account;

        before(() => {
            account = factory.createFromPrivateKey(privKey);
        });

        it('has the correct private and public key', () => {
            assert.equal(account.keyType, 'secp256k1');
            assert.equal(account.signKeys.privateKey.base58, privKey);
            assert.equal(account.signKeys.publicKey.base58, pubKey);
        });

        it('can sign an verify a message', () => {
            const signature = account.sign(message);
            assert(account.verify(message, signature));
        });
    });

    describe.skip('from public key', () => {
        let account: Account;

        before(() => {
            account = factory.createFromPublicKey(pubKey);
        });

        it('has the correct public key', () => {
            assert.equal(account.keyType, 'secp256k1');
            assert.equal(account.signKeys.publicKey.base58, pubKey);
        });

        it('can verify a signed message', () => {
            assert(account.verify(message, signature));
        });
    });
});
