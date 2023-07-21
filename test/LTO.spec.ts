import { expect } from 'chai';
import * as sinon from 'sinon';

import LTO, { Binary } from '../src';
import { PublicNode } from '../src/node';
import { Relay } from '../src/messages';
import { Account, AccountFactory, AccountFactoryECDSA, AccountFactoryED25519 } from '../src/accounts';
import { encryptSeed } from '../src/utils';

describe('LTO', () => {
  let lto: LTO;

  beforeEach(() => {
    lto = new LTO('T');
  });

  describe('constructor', () => {
    it('should set the network id', () => {
      expect(lto.networkId).to.equal('T');
    });

    it('should set the default node and node address', () => {
      expect(lto.nodeAddress).to.equal('https://testnet.lto.network');

      expect(lto.node).to.be.instanceOf(PublicNode);
      expect(lto.node.url).to.equal('https://testnet.lto.network');
      expect(lto.node.apiKey).to.equal('');
    });

    it('should set the default relay', () => {
      expect(lto.relay).to.be.instanceOf(Relay);
      expect(lto.relay.url).to.equal('https://relay.lto.network');
    });

    it('should initialize account factories', () => {
      expect(lto.accountFactories).to.be.an('object');

      // Check for each type of account factory
      expect(lto.accountFactories.ed25519).to.be.an.instanceOf(AccountFactoryED25519);
      expect(lto.accountFactories.secp256r1).to.be.an.instanceOf(AccountFactoryECDSA);
      expect(lto.accountFactories.secp256k1).to.be.an.instanceOf(AccountFactoryECDSA);

      // Ensure factories have correct networkId
      expect(lto.accountFactories.ed25519.networkId).to.equal('T');
      expect(lto.accountFactories.secp256r1.networkId).to.equal('T');
      expect(lto.accountFactories.secp256k1.networkId).to.equal('T');
    });

    it('should accept a custom network id', () => {
      lto = new LTO('L');

      expect(lto.networkId).to.equal('L');

      expect(lto.nodeAddress).to.equal('https://nodes.lto.network');
      expect(lto.node).to.be.instanceOf(PublicNode);
      expect(lto.node.url).to.equal('https://nodes.lto.network');
    });

    it('should not set default node for an unknown network id', () => {
      lto = new LTO('Z');

      expect(lto.networkId).to.equal('Z');

      expect(() => lto.node).to.throw('Public node not configured');
      expect(() => lto.nodeAddress).to.throw('Public node not configured');
    });
  });

  describe('account', () => {
    let mockFactory: sinon.SinonStubbedInstance<AccountFactoryED25519>;
    let mockFactoryECDSA: sinon.SinonStubbedInstance<AccountFactoryECDSA>;
    let mockAccount: sinon.SinonStubbedInstance<Account>;

    beforeEach(() => {
      mockFactory = sinon.createStubInstance(AccountFactoryED25519);
      mockFactoryECDSA = sinon.createStubInstance(AccountFactoryECDSA);

      lto.accountFactories = {
        ed25519: mockFactory,
        secp256r1: mockFactoryECDSA,
        secp256k1: mockFactoryECDSA,
      } as any;
    });

    beforeEach(() => {
      mockAccount = sinon.createStubInstance(Account);
      (mockAccount as any).address = 'testAddress';
      sinon.stub(mockAccount, 'privateKey').get(() => 'testPrivateKey');
      sinon.stub(mockAccount, 'publicKey').get(() => 'testPublicKey');

      mockFactory.create.returns(mockAccount);
      mockFactory.createFromSeed.returns(mockAccount);
      mockFactory.createFromPrivateKey.returns(mockAccount);
      mockFactory.createFromPublicKey.returns(mockAccount);

      mockFactoryECDSA.create.returns(mockAccount);
      mockFactoryECDSA.createFromSeed.returns(mockAccount);
      mockFactoryECDSA.createFromPrivateKey.returns(mockAccount);
      mockFactoryECDSA.createFromPublicKey.returns(mockAccount);
    });

    it('should create a random account', () => {
      expect(lto.account()).to.equal(mockAccount);
      expect(mockFactory.create.calledOnce).to.be.true;
    });

    it('should create account from privateKey', () => {
      const settings = { privateKey: 'testPrivateKey' };
      expect(lto.account(settings)).to.equal(mockAccount);
      expect(mockFactory.createFromPrivateKey.calledWith(settings.privateKey)).to.be.true;
    });

    it('should create account from publicKey', () => {
      const settings = { publicKey: 'testPublicKey' };
      expect(lto.account(settings)).to.equal(mockAccount);
      expect(mockFactory.createFromPublicKey.calledWith(settings.publicKey)).to.be.true;
    });

    describe('from seed', () => {
      it('should create account from seed', () => {
        const settings = { seed: 'testSeed' };
        expect(lto.account(settings)).to.equal(mockAccount);
        expect(mockFactory.createFromSeed.calledWith(settings.seed, undefined)).to.be.true;
      });

      it('should create account from seed and nonce', () => {
        const settings = { seed: 'testSeed', nonce: 1 };
        expect(lto.account(settings)).to.equal(mockAccount);
        expect(mockFactory.createFromSeed.calledWith(settings.seed, settings.nonce)).to.be.true;
      });

      it('should create account from seed and binary nonce', () => {
        const settings = { seed: 'testSeed', nonce: Uint8Array.from([1, 2, 3]) };
        expect(lto.account(settings)).to.equal(mockAccount);
        expect(mockFactory.createFromSeed.calledWith(settings.seed, settings.nonce)).to.be.true;
      });

      it('should create account from seed and binary nonce', () => {
        const settings = { seed: 'testSeed', nonce: 'base64:dGVzdA==' };
        expect(lto.account(settings)).to.equal(mockAccount);
        expect(mockFactory.createFromSeed.calledWith(settings.seed, new Binary('test'))).to.be.true;
      });

      it('should create account from encrypted seed', () => {
        const seed = encryptSeed('testSeed', 'testPassword');
        const settings = { seed, seedPassword: 'testPassword' };

        expect(lto.account(settings)).to.equal(mockAccount);
        expect(mockFactory.createFromSeed.calledWith('testSeed', undefined)).to.be.true;
      });

      it('should create account from parent', () => {
        const seed = 'mock parent seed';
        const mockParentAccount = sinon.createStubInstance(Account);
        (mockParentAccount as any).seed = seed;

        const settings = { parent: mockParentAccount, nonce: 1 };
        const account = lto.account(settings);

        expect(account).to.equal(mockAccount);
        expect(mockFactory.createFromSeed.calledWith(seed, 1)).to.be.true;
        expect(account.parent).to.equal(mockParentAccount);
      });

      it('should create account from parent seed', () => {
        const mockParentAccount = sinon.createStubInstance(Account);
        mockFactory.createFromSeed.onCall(0).returns(mockAccount);
        mockFactory.createFromSeed.onCall(1).returns(mockParentAccount);

        const settings = { parent: { seed: 'parentSeed' }, nonce: 1 };
        const account = lto.account(settings);

        expect(account).to.equal(mockAccount);
        expect(mockFactory.createFromSeed.calledWith(settings.parent.seed, undefined)).to.be.true;
        expect(mockFactory.createFromSeed.calledWith(settings.parent.seed, 1)).to.be.true;
      });

      it('should create a random account with specific derivation path', () => {
        const settings = { derivationPath: `m/44'/60'/0'/0` };

        expect(lto.account(settings)).to.equal(mockAccount);
        expect(mockFactory.createFromSeed.calledWith('', new Binary(settings.derivationPath))).to.be.true;
      });

      it('should throw error for invalid nonce', () => {
        expect(() => lto.account({ nonce: 'invalid' })).to.throw(
          'Invalid nonce: must be a number, binary value, or base64 string prefixed with "base64:"',
        );
      });
    });

    describe('with keyType', () => {
      it('should throw error for invalid key type', () => {
        expect(() => lto.account({ keyType: 'invalid' })).to.throw('Invalid key type: invalid');
      });

      for (const keyType of ['ed25519', 'secp256k1']) {
        let expectedFactory: sinon.SinonStubbedInstance<AccountFactory>;

        beforeEach(() => {
          expectedFactory = keyType === 'ed25519' ? mockFactory : mockFactoryECDSA;
        });

        it(`should create a random ${keyType} account`, () => {
          lto.account({ keyType });
          expect(expectedFactory.create.calledOnce).to.be.true;
        });

        it(`should create an ${keyType} account from seed`, () => {
          lto.account({ seed: 'testSeed', keyType });
          expect(expectedFactory.createFromSeed.calledOnce).to.be.true;
        });

        it(`should create an ${keyType} account from private key`, () => {
          lto.account({ privateKey: 'testPrivateKey', keyType });
          expect(expectedFactory.createFromPrivateKey.calledOnce).to.be.true;
        });

        it(`should create an ${keyType} account from public key`, () => {
          lto.account({ publicKey: 'testPublicKey', keyType });
          expect(expectedFactory.createFromPublicKey.calledOnce).to.be.true;
        });
      }
    });

    describe('guard', () => {
      it('should throw error when privateKey does not match account privateKey', () => {
        expect(() => lto.account({ privateKey: 'differentPrivateKey' })).to.throw('Private key mismatch');
        expect(() => lto.account({ privateKey: new Binary('differentPrivateKey') })).to.throw('Private key mismatch');
      });

      it('should throw error when publicKey does not match account publicKey', () => {
        expect(() => lto.account({ publicKey: 'differentPublicKey' })).to.throw('Public key mismatch');
        expect(() => lto.account({ publicKey: new Binary('differentPublicKey') })).to.throw('Public key mismatch');
      });

      it('should throw error when address does not match account address', () => {
        expect(() => lto.account({ address: 'differentAddress' })).to.throw('Address mismatch');
      });
    });
  });

  describe('node', () => {
    it('should set node when changing node address', () => {
      lto.nodeAddress = 'https://example.com';

      expect(lto.nodeAddress).to.equal('https://example.com');

      expect(lto.node).to.be.instanceOf(PublicNode);
      expect(lto.node.url).to.equal('https://example.com');
      expect(lto.node.apiKey).to.equal('');
    });

    it('should set node address when changing node', () => {
      const node = new PublicNode('https://example.com', 'testApiKey');
      lto.node = node;

      expect(lto.node).to.be.equal(node);
      expect(lto.nodeAddress).to.equal('https://example.com');
    });
  });
});
