import {assert} from 'chai';
import {Account, AccountFactoryECDSA} from '../../src/accounts';
import Binary from "../../src/Binary";

describe('secp256k1 account', () => {
    const seed = '';
    const nonce = 2;
    const privKey = '7poBZFLzoHLX3j8C4n6dzmZWPQGB7Ypu2KRfbBCk3jWa';
    const pubKey = 'N3Wfi5cxmK7TLwnb3s9G9vizLjoNtMZEy988XqME28qiRPkeUimH5mGEPJL2bxNGs6qrCDHJF1fwg9TXebvnVmie';
    const message = 'hello';
    const signature = Binary.fromBase58(''); // TODO

    const factory = new AccountFactoryECDSA('T', 'secp256k1');

    describe('random', () => {
        const account = factory.create();

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
        const account = factory.createFromSeed(seed, 2);

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
        const account = factory.createFromPrivateKey(privKey);

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
        const account = factory.createFromPublicKey(pubKey);

        it('has the correct public key', () => {
            assert.equal(account.keyType, 'secp256k1');
            assert.equal(account.signKeys.publicKey.base58, pubKey);
        });

        it('can verify a signed message', () => {
            assert(account.verify(message, signature));
        });
    });
});
