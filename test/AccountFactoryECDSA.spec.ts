import { assert } from 'chai';
import { AccountFactoryECDSA } from '../src/accounts/ecdsa/AccountFactoryECDSA';
import encoder from "../src/utils/encoder";
import crypto from "../src/utils/crypto";
import { Account } from '../src/LTO';


let message = 'hello';
let signature: string;
let privKey = '7poBZFLzoHLX3j8C4n6dzmZWPQGB7Ypu2KRfbBCk3jWa';
let pubKey = 'N3Wfi5cxmK7TLwnb3s9G9vizLjoNtMZEy988XqME28qiRPkeUimH5mGEPJL2bxNGs6qrCDHJF1fwg9TXebvnVmie';
let factory;

describe('AccountFactoryECDSA', () => {

    beforeEach(() => {
        factory = new AccountFactoryECDSA('T');
    });




    describe('#format', () => {
        it('genearte random EC pair', () => {
            
        });
    });

    describe('#buildSignKeyPairFromRandom', () => {
        it('genearte random EC pair', () => {
            let ec = factory.buildSignKeyPair();
            assert(ec.privateKey instanceof Uint8Array);
            assert(ec.publicKey instanceof Uint8Array);
            assert.lengthOf(ec.privateKey, 32);
            assert.lengthOf(ec.publicKey, 65);
            assert.lengthOf(encoder.decode(factory.compressedPubKey, "base58"), 33);
        });
    });

    describe('#buildSignKeyPairFromPrivateKey', () => {
        it('genearte EC pair from privateKey given in base58 standard', () => {
            let ec = factory.buildSignKeyPair();
            assert(ec.privateKey instanceof Uint8Array);
            assert(ec.publicKey instanceof Uint8Array);
            assert.lengthOf(ec.privateKey, 32);
            assert.lengthOf(ec.publicKey, 65);
            assert.lengthOf(encoder.decode(factory.compressedPubKey, "base58"), 33);
            assert.equal(encoder.encode(ec.publicKey, 'base58'), 
                'N3Wfi5cxmK7TLwnb3s9G9vizLjoNtMZEy988XqME28qiRPkeUimH5mGEPJL2bxNGs6qrCDHJF1fwg9TXebvnVmie');
            assert.equal(factory.compressedPubKey, 'vcHtjj77tE1QFSe3t7cjvWae7tVR4NuLPudkakVZtdRs');
        });
    });

    describe('#create', () => {
        it('creates a random account', () => {
            let account = factory.create();
            assert.lengthOf(account.address, 35);
            assert.equal(account.networkByte, crypto.getNetwork(account.address))
        });
    });

    describe('#createFromPrivateKey', () => {
        it('creates an account from privateKey', () => {
            let account = factory.createFromPrivateKey(privKey);
            assert(account instanceof Account);
            assert.lengthOf(account.address, 35);
            assert.equal(account.networkByte, crypto.getNetwork(account.address))
            assert.equal(account.address, '3Mt4446SBUJDjPmPvTe3WPYaVL4mt1hY7p9');
        });
    });
});
