import { expect } from 'chai';
import * as sinon from 'sinon';

import { PublicNode } from '../../src/node';
import { RequestError } from '../../src/errors';
import { ITxJSON } from '../../src/types';
import { Anchor } from '../../src/transactions';

describe('PublicNode', () => {
  let publicNode: PublicNode;

  const clean = (obj: Record<string, any>) => {
    Object.keys(obj).forEach((key) => obj[key] === undefined && delete obj[key]);
    return obj;
  };

  const tx: ITxJSON = {
    type: 15,
    version: 3,
    sender: '3N4mZ1qTrjWKnzBwAxscf7kfkoCs2HGQhJG',
    senderKeyType: 'ed25519',
    senderPublicKey: '2KduZAmAKuXEL463udjCQkVfwJkBQhpciUC4gNiayjSJ',
    fee: 35000000,
    timestamp: 1519862400000,
    anchors: ['GKot5hBsd81kMupNCXHaqbhv3huEbxAFMLnpcX2hniwn'],
    proofs: ['5L1N7h7jxSeG7gATTqRibDwHvuHBW57uy78WDxHivybEhdVXKN5F7tBSbytgWqTwXbqWEMaD2J3qmTFALyDAwyrJ'],
  };

  beforeEach(() => {
    publicNode = new PublicNode('https://example.com', 'API_KEY');
  });

  describe('post', () => {
    it('should make a POST request with the correct URL, headers, and body', async () => {
      const fetchStub = sinon
        .stub(publicNode as any, 'fetch')
        .resolves({ ok: true, json: () => Promise.resolve({ foo: 'bar' }) });

      const endpoint = '/test';
      const postData = { data: 'test' };

      const result = await publicNode.post(endpoint, postData);

      expect(result).to.deep.equal({ foo: 'bar' });

      expect(fetchStub.calledOnce).to.be.true;
      expect(fetchStub.firstCall.args[0]).to.equal('https://example.com/test');
      expect(fetchStub.firstCall.args[1]).to.deep.equal({
        method: 'POST',
        headers: {
          'X-API-Key': 'API_KEY',
          'content-type': 'application/json',
        },
        body: JSON.stringify(postData),
      });
    });

    it('should throw a RequestError if the request fails', async () => {
      sinon
        .stub(publicNode as any, 'fetch')
        .resolves({ ok: false, json: () => Promise.resolve({ error: 100, message: 'error message' }) });

      const endpoint = '/test';
      const postData = { data: 'test' };

      try {
        await publicNode.post(endpoint, postData);
        // Expecting the above line to throw an error, so the line below should not be reached
        expect.fail('Expected RequestError to be thrown');
      } catch (error) {
        expect(error).to.be.instanceOf(RequestError);
        expect((error as RequestError).data).to.deep.equal({ error: 100, message: 'error message' });
        expect((error as RequestError).message).to.contain("Server request to 'https://example.com/test' has failed");
      }
    });
  });

  describe('get', () => {
    it('should make a GET request with the correct URL and headers', async () => {
      const fetchStub = sinon
        .stub(publicNode as any, 'fetch')
        .resolves({ ok: true, json: () => Promise.resolve({ foo: 'bar' }) });

      const result = await publicNode.get('/test');

      expect(result).to.deep.equal({ foo: 'bar' });

      expect(fetchStub.calledOnce).to.be.true;
      expect(fetchStub.firstCall.args[0]).to.equal('https://example.com/test');
      expect(fetchStub.firstCall.args[1]).to.deep.equal({
        method: 'GET',
        headers: { 'X-API-Key': 'API_KEY' },
      });
    });

    it('should throw a RequestError if the request fails', async () => {
      sinon
        .stub(publicNode as any, 'fetch')
        .resolves({ ok: false, json: () => Promise.resolve({ error: 100, message: 'error message' }) });

      try {
        await publicNode.get('/test');
        // Expecting the above line to throw an error, so the line below should not be reached
        expect.fail('Expected RequestError to be thrown');
      } catch (error) {
        expect(error).to.be.instanceOf(RequestError);
        expect((error as RequestError).data).to.deep.equal({ error: 100, message: 'error message' });
        expect((error as RequestError).message).to.contain("Server request to 'https://example.com/test' has failed");
      }
    });
  });

  describe('broadcast', () => {
    const stubData = { id: 'ELtXhrFTCRJSEweYAAaVTuv9wGjNzwHYUDnH6UT1JxmB', ...tx };

    it('should make a POST request to /transactions/broadcast with the transaction', async () => {
      const fetchStub = sinon
        .stub(publicNode as any, 'fetch')
        .resolves({ ok: true, json: () => Promise.resolve(stubData) });

      const result = await publicNode.broadcast(Anchor.from(tx));

      expect(result).to.be.instanceOf(Anchor);
      expect(clean(result.toJSON())).to.deep.equal(stubData);

      expect(fetchStub.calledOnce).to.be.true;
      expect(fetchStub.firstCall.args[0]).to.equal('https://example.com/transactions/broadcast');
      expect(fetchStub.firstCall.args[1]).to.deep.equal({
        method: 'POST',
        headers: {
          'X-API-Key': 'API_KEY',
          'content-type': 'application/json',
        },
        body: JSON.stringify(tx),
      });
    });
  });

  describe('submit', () => {
    const stubData = { id: 'ELtXhrFTCRJSEweYAAaVTuv9wGjNzwHYUDnH6UT1JxmB', ...tx };

    it('should make a POST request to /transactions/submit with the transaction', async () => {
      const fetchStub = sinon
        .stub(publicNode as any, 'fetch')
        .resolves({ ok: true, json: () => Promise.resolve(stubData) });

      const result = await publicNode.submit(Anchor.from(tx));

      expect(result).to.be.instanceOf(Anchor);
      expect(clean(result.toJSON())).to.deep.equal(stubData);

      expect(fetchStub.calledOnce).to.be.true;
      expect(fetchStub.firstCall.args[0]).to.equal('https://example.com/transactions/submit');
      expect(fetchStub.firstCall.args[1]).to.deep.equal({
        method: 'POST',
        headers: {
          'X-API-Key': 'API_KEY',
          'content-type': 'application/json',
        },
        body: JSON.stringify(tx),
      });
    });
  });

  describe('status', () => {
    const status = {
      blockchainHeight: 2373404,
      stateHeight: 2373404,
      updatedTimestamp: 1687263279853,
      updatedDate: '2023-06-20T12:14:39.853Z',
    };

    it('should make a GET request to /node/status', async () => {
      const fetchStub = sinon
        .stub(publicNode as any, 'fetch')
        .resolves({ ok: true, json: () => Promise.resolve(status) });

      const result = await publicNode.status();

      expect(result).to.deep.equal(status);
      expect(fetchStub.calledOnceWith('https://example.com/node/status')).to.be.true;
    });
  });

  describe('version', () => {
    it('should make a GET request to /node/version', async () => {
      const fetchStub = sinon
        .stub(publicNode as any, 'fetch')
        .resolves({ ok: true, json: () => Promise.resolve({ version: '1.2.3' }) });

      const result = await publicNode.version();

      expect(result).to.equal('1.2.3');
      expect(fetchStub.calledOnceWith('https://example.com/node/version')).to.be.true;
    });
  });
});
