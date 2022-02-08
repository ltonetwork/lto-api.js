import { expect } from 'chai';
import { EventChain } from '../src/events/EventChain';
import { Event } from '../src/events/Event';
import { Account } from '../src/accounts/Account';
import encoder from '../src/utils/encoder';
import * as sinon from 'sinon';
import { AccountFactoryED25519 } from '../src/accounts/ed25519/AccountFactoryED25519';

describe('EventChain', () => {

  describe('#constructor', () => {
    it('should generate a correct hash from the id', () => {
      const chain = new EventChain('L1hGimV7Pp2CFNUnTCitqWDbk9Zng3r3uc66dAG6hLwEx');

      expect(chain.id).to.eq('L1hGimV7Pp2CFNUnTCitqWDbk9Zng3r3uc66dAG6hLwEx');
      expect(chain.getLatestHash()).to.eq('9HM1ykH7AxLgdCqBBeUhvoTH4jkq3zsZe4JGTrjXVENg');
    });
  });

  describe.skip('#init', () => {
    it('should generate the correct chain id when initiated for an account with random nonce', () => {
      const account = new AccountFactoryED25519('T').create();
      account.sign = {
        privateKey: encoder.decode('random'),
        publicKey: encoder.decode('8MeRTc26xZqPmQ3Q29RJBwtgtXDPwR7P9QNArymjPLVQ')
      };

      const stub = sinon.stub(EventChain.prototype, 'getRandomNonce').returns(new Uint8Array(20).fill(0));

      const chain = new EventChain();
      chain.init(account);

      stub.restore();

      expect(chain.id).to.eq('2ar3wSjTm1fA33qgckZ5Kxn1x89gKcDPBXTxw56YukdUvrcXXcQh8gKCs8teBh');
      expect(chain.getLatestHash()).to.eq('9y3W6WUsNC72kAa9yeo3kB8b9wULJvBXPRgaHmfXvXjw');
      sinon.assert.calledOnce(stub);
    });

    it('should generate the correct chain id when initiated for an account with a nonce', () => {
      const account = new AccountFactoryED25519('T').create();
      account.sign = {
        privateKey: encoder.decode('random'),
        publicKey: encoder.decode('8MeRTc26xZqPmQ3Q29RJBwtgtXDPwR7P9QNArymjPLVQ')
      };

      const chain = new EventChain();
      const getRandomNonce = sinon.spy(chain, 'getRandomNonce');
      chain.init(account, 'foo');

      getRandomNonce.restore();

      expect(chain.id).to.eq('2b6QYLttL2R3CLGL4fUB9vaXXX4c5aFFsoeAmzHWEhqp3bTS49bpomCMTmbV9E');
      expect(chain.getLatestHash()).to.eq('8TJX8LsZCr38uhog9m9YjMF3GNfCDfPCivy6z8Ly5d6f');
      sinon.assert.notCalled(getRandomNonce);
    });
  });

  describe('#addEvent', () => {
    it('should add an event and return the latest hash', () => {
      const stub = sinon.stub(Event.prototype, 'getHash').returns('J26EAStUDXdRUMhm1UcYXUKtJWTkcZsFpxHRzhkStzbS');
      const event = new Event();

      const chain = new EventChain('L1hGimV7Pp2CFNUnTCitqWDbk9Zng3r3uc66dAG6hLwEx');
      chain.addEvent(event);

      expect(chain.getLatestHash()).to.eq('J26EAStUDXdRUMhm1UcYXUKtJWTkcZsFpxHRzhkStzbS');
      stub.restore();
    });
  });

  describe('#getProjectionId', () => {
    it('should generate a correct projection id with a random nonce', () => {

      const chain = new EventChain();
      const getRandomNonce = sinon.spy(chain, 'getRandomNonce');

      chain.id = '2b6QYLttL2R3CLGL4fUB9vaXXX4c5HJanjV5QecmAYLCrD52o6is1fRMGShUUF';
      expect(chain.createProjectionId('foo')).to.eq('2z4AmxL122aaTLyVy6rhEfXHGJMGuXrmahjVCXwYz6GxATR8x3PXNq3XbwbJ2H');
      getRandomNonce.restore();
      sinon.assert.notCalled(getRandomNonce);
    });

    it('should generate a correct projection id with a set nonce', () => {

      const stub = sinon.stub(EventChain.prototype, 'getRandomNonce').returns(new Uint8Array(20).fill(0));
      const chain = new EventChain();
      chain.id = '2b6QYLttL2R3CLGL4fUB9vaXXX4c5HJanjV5QecmAYLCrD52o6is1fRMGShUUF';

      expect(chain.createProjectionId()).to.eq('2yopB4AaT1phJ4YrXBwbQhimguSM9ZpttRZHMckbf94d3iaERWCPhkAP4quKbs');
      stub.restore();
    })
  })
});
