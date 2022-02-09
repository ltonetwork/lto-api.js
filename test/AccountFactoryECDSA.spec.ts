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

    describe('#buildSignKeyPairFromRandom', () => {
        it('genearte random compressed and uncompressed EC pair', () => {
            let {compressed, uncompressed} = AccountFactoryECDSA.buildSignKeyPairFromRandom('secp256k1');
            assert(uncompressed.privateKey instanceof Uint8Array);
            assert(uncompressed.publicKey instanceof Uint8Array);
            assert.lengthOf(uncompressed.privateKey, 32);
            assert.lengthOf(uncompressed.publicKey, 65);
            assert.lengthOf(compressed.publicKey, 33);
        });
    });

    describe('#buildSignKeyPairFromPrivateKey', () => {
        it('genearte EC pair from privateKey given in base58 standard', () => {
            let {compressed, uncompressed} = AccountFactoryECDSA.buildSignKeyPairFromPrivateKey(privKey, 'secp256k1');
            assert(uncompressed.privateKey instanceof Uint8Array);
            assert(uncompressed.publicKey instanceof Uint8Array);
            assert.lengthOf(uncompressed.privateKey, 32);
            assert.lengthOf(uncompressed.publicKey, 65);
            assert.lengthOf(compressed.publicKey, 33);
            assert.equal(encoder.encode(uncompressed.publicKey, 'base58'), 
                'N3Wfi5cxmK7TLwnb3s9G9vizLjoNtMZEy988XqME28qiRPkeUimH5mGEPJL2bxNGs6qrCDHJF1fwg9TXebvnVmie');
            assert.equal(encoder.encode(compressed.publicKey, "base58"), 'vcHtjj77tE1QFSe3t7cjvWae7tVR4NuLPudkakVZtdRs');
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
            assert.equal(account.address, '3MwMooymVxt2ED1NYPRm3o5dvsBtsEaC6ue');
        });
    });
});
