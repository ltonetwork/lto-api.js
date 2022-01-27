import { assert } from 'chai';
import { AccountFactoryECDSA } from '../src/classes/AccountFactories/AccountFactoryECDSA';
import { IKeyPairBytes } from "../interfaces";
import encoder from "../src/utils/encoder";
import crypto from "../src/utils/crypto";
import { sign } from 'crypto';


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
        it('genearte random EC pair', () => {
            let ec = factory.buildSignKeyPairFromRandom();
            assert(ec.privateKey instanceof Uint8Array);
            assert(ec.publicKey instanceof Uint8Array);
            assert.lengthOf(ec.privateKey, 32);
            assert.lengthOf(ec.publicKey, 65);
            assert.lengthOf(encoder.decode(factory.compressedPubKey, "base58"), 33);
        });
    });

    describe('#buildSignKeyPairFromPrivateKey', () => {
        it('genearte EC pair from privateKey given in base58 standard', () => {
            let ec = factory.buildSignKeyPairFromPrivateKey(privKey);
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
            assert.equal(account.networkByte, crypto.getnetwork(account.address))
        });
    });

    describe('#createFromPrivateKey', () => {
        it('creates an account from privateKey', () => {
            let account = factory.createFromPrivateKey(privKey);
            assert.lengthOf(account.address, 35);
            assert.equal(account.networkByte, crypto.getnetwork(account.address))
            assert.equal(account.address, '3MwMooymVxt2ED1NYPRm3o5dvsBtsEaC6ue');
        });
    });

    describe('#createSignature', () => {
        it('creates the signature', () => {
            signature = factory.createSignature(message, privKey);
            assert.includeMembers([87, 88], [signature.length]);
        });
    });

    describe('#verifySignature', () => {
        it('verify the signature', () => {
            assert(factory.verifySignature(message, signature, pubKey));
        });
    });

});