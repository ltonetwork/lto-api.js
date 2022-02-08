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
        it('genearte random compressed and uncompressed EC pair', () => {
            let {compressed, uncompressed} = AccountFactoryECDSA.buildSignKeyPairFromRandom();
            assert(uncompressed.privateKey instanceof Uint8Array);
            assert(uncompressed.publicKey instanceof Uint8Array);
            assert.lengthOf(uncompressed.privateKey, 32);
            assert.lengthOf(uncompressed.publicKey, 65);
            assert.lengthOf(compressed.publicKey, 33);
        });
    });

    describe('#buildSignKeyPairFromPrivateKey', () => {
        it('genearte EC pair from privateKey given in base58 standard', () => {
            let {compressed, uncompressed} = AccountFactoryECDSA.buildSignKeyPairFromPrivateKey(privKey);
            assert(uncompressed.privateKey instanceof Uint8Array);
            assert(uncompressed.publicKey instanceof Uint8Array);
            assert.lengthOf(uncompressed.privateKey, 32);
            assert.lengthOf(uncompressed.publicKey, 65);
            assert.lengthOf(compressed.publicKey, 33);
            assert.equal(encoder.encode(uncompressed.publicKey, 'base58'), 
                'N1cL2EHX5gDTwKXnki4RpQWrKS8CtDaJXLzHEWLo3mAH1gc5aYVPQ8Zo7aP88W4Vwj5Qc9DqdTKoGTYj94K6Uw5W');
            assert.equal(encoder.encode(compressed.publicKey, "base58"), 'vVtTUEbLKcnU5xbqKJsjJMeedH35t243XDZGL6RiCEh9');
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
            assert.equal(account.address, '3Mv3uCdijjkURh1sty1tFt1T98F2K8xzygJ');
        });
    });
});
