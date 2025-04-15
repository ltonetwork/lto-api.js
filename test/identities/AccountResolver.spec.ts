// noinspection DuplicatedCode

import { expect } from 'chai';
import * as sinon from 'sinon';
import { AccountResolver } from '../../src/identities';
import { Account } from '../../src/accounts';

describe('AccountResolver', () => {
  const address = '3N7RAo9eXFhJEdpPgbhsAFti8s1HDxxXiCW';
  const publicKey = '3ct1eeZg1ryzz24VHk4CigJxW6Adxh7Syfm459CmGNv2';
  const networkId = 'T';
  const url = 'https://example.com/1.0/identifiers';

  describe('#resolve', () => {
    const keyTypes = [
      ['Ed25519VerificationKey2018', 'ed25519', publicKey],
      ['Ed25519VerificationKey2020', 'ed25519', publicKey],
      ['EcdsaSecp256k1VerificationKey2019', 'secp256k1', 'k6kUC53X8vQRrNxe9fKqrNg91TVLcejZ2YyJvKprGbfd'],
      ['EcdsaSecp256r1VerificationKey2019', 'secp256r1', 'mi9z8ZkBUtoW7coxStvdJw8GPann7ATzaCPG9RQdxbVx'],
    ];

    keyTypes.forEach(([didKeyType, keyType, publicKey]) => {
      it(`should resolve ${didKeyType} account`, async () => {
        const didDocument = {
          id: `did:lto:${address}`,
          verificationMethod: [
            {
              id: `#sign`,
              type: didKeyType,
              publicKeyMultibase: `z${publicKey}`,
            },
          ],
        };

        const accountResolver = new AccountResolver(networkId, url);
        const fetchStub = sinon
          .stub(accountResolver as any, 'fetch')
          .resolves({ ok: true, status: 200, json: () => Promise.resolve(didDocument) });

        const account = await accountResolver.resolve(address);

        expect(fetchStub.calledOnceWithExactly(`${url}/${address}`, { method: 'GET' })).to.be.true;
        expect(account).to.be.an.instanceOf(Account);
        expect(account.keyType).to.equal(keyType);
        expect(account.publicKey).to.equal(publicKey);
      });
    });

    it(`should resolve an account with a publicKeyBase58 key`, async () => {
      const didDocument = {
        id: `did:lto:${address}`,
        verificationMethod: [
          {
            id: `#sign`,
            type: 'Ed25519VerificationKey2020',
            publicKeyBase58: publicKey,
          },
        ],
      };

      const accountResolver = new AccountResolver(networkId, url);
      const fetchStub = sinon
        .stub(accountResolver as any, 'fetch')
        .resolves({ ok: true, status: 200, json: () => Promise.resolve(didDocument) });

      const account = await accountResolver.resolve(address);

      expect(fetchStub.calledOnceWithExactly(`${url}/${address}`, { method: 'GET' })).to.be.true;
      expect(account).to.be.an.instanceOf(Account);
      expect(account.keyType).to.equal('ed25519');
      expect(account.publicKey).to.equal(publicKey);
    });

    it(`should resolve an account with DID in verification method id`, async () => {
      const didDocument = {
        id: `did:lto:${address}`,
        verificationMethod: [
          {
            id: `did:lto:${address}#sign`,
            type: 'Ed25519VerificationKey2020',
            publicKeyMultibase: `z${publicKey}`,
          },
        ],
      };

      const accountResolver = new AccountResolver(networkId, url);
      const fetchStub = sinon
        .stub(accountResolver as any, 'fetch')
        .resolves({ ok: true, status: 200, json: () => Promise.resolve(didDocument) });

      const account = await accountResolver.resolve(address);

      expect(fetchStub.calledOnceWithExactly(`${url}/${address}`, { method: 'GET' })).to.be.true;
      expect(account).to.be.an.instanceOf(Account);
      expect(account.keyType).to.equal('ed25519');
      expect(account.publicKey).to.equal(publicKey);
    });

    it('should throw an error for unknown public key', async () => {
      const errorResponse = { error: 'notFound' };

      const accountResolver = new AccountResolver(networkId, url);
      const fetchStub = sinon
        .stub(accountResolver as any, 'fetch')
        .resolves({ status: 404, json: () => Promise.resolve(errorResponse) });

      try {
        await accountResolver.resolve(address);
        expect.fail('Expected an error to be thrown');
      } catch (error) {
        expect(fetchStub.calledOnceWithExactly(`${url}/${address}`, { method: 'GET' })).to.be.true;
        expect((error as Error).message).to.equal(`Public key of ${address} is unknown`);
      }
    });

    it('should throw an error for missing public sign key', async () => {
      const didDocument = {
        id: `did:lto:${address}`,
        verificationMethod: [
          {
            id: `did:lto:${address}#encrypt`,
            type: 'XVerificationKey2018',
            publicKeyMultibase: `z${publicKey}`,
          },
        ],
      };

      const accountResolver = new AccountResolver(networkId, url);
      const fetchStub = sinon
        .stub(accountResolver as any, 'fetch')
        .resolves({ ok: true, status: 200, json: () => Promise.resolve(didDocument) });

      try {
        await accountResolver.resolve(address);
        expect.fail('Expected an error to be thrown');
      } catch (error) {
        expect(fetchStub.calledOnceWithExactly(`${url}/${address}`, { method: 'GET' })).to.be.true;
        expect((error as Error).message).to.equal(`Public sign key for ${address} not found in DID document 'did:lto:${address}'`);
      }
    });
  });
});
