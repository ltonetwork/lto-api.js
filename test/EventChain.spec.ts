import { expect } from 'chai';
import { EventChain } from '../src/classes/EventChain';
import { Event } from '../src/classes/Event';
import { Account } from '../src/classes/Account';
import encoder from '../src/utils/encoder';
import * as sinon from 'sinon';

describe('EventChain', () => {

  describe('#constructor', () => {
    it('should generate a correct hash from the id', () => {
      const chain = new EventChain('L1hGimV7Pp2CFNUnTCitqWDbk9Zng3r3uc66dAG6hLwEx');

      expect(chain.id).to.eq('L1hGimV7Pp2CFNUnTCitqWDbk9Zng3r3uc66dAG6hLwEx');
      expect(chain.getLatestHash()).to.eq('9HM1ykH7AxLgdCqBBeUhvoTH4jkq3zsZe4JGTrjXVENg');
    });
  });

  describe('#init', () => {
    it('should generate the correct chain id when initiated for an account with random nonce', () => {
      const account = new Account();
      account.sign = {
        publicKey: encoder.decode('8MeRTc26xZqPmQ3Q29RJBwtgtXDPwR7P9QNArymjPLVQ')
      };

      const stub = sinon.stub(EventChain.prototype, 'getRandomNonce').returns(new Uint8Array(20).fill(0));

      const chain = new EventChain();
      chain.init(account);

      stub.restore();

      expect(chain.id).to.eq('2ar3wSjTm1fA33qgckZ5Kxn1x89gKKGi6TJsZjRoqb7sjUE8GZXjLaYCbCa2GX');
      expect(chain.getLatestHash()).to.eq('3NTzfLcXq1D5BRzhj9EyVbmAcLsz1pa6ZjdxRySbYze1');
      sinon.assert.calledOnce(stub);
    });

    it('should generate the correct chain id when initiated for an account with a nonce', () => {
      const account = new Account();
      account.sign = {
        publicKey: encoder.decode('8MeRTc26xZqPmQ3Q29RJBwtgtXDPwR7P9QNArymjPLVQ')
      };

      const chain = new EventChain();
      const getRandomNonce = sinon.spy(chain, 'getRandomNonce');
      chain.init(account, 'foo');

      getRandomNonce.restore();

      expect(chain.id).to.eq('2b6QYLttL2R3CLGL4fUB9vaXXX4c5HJanjV5QecmAYLCrD52o6is1fRMGShUUF');
      expect(chain.getLatestHash()).to.eq('8FjrD9Req4C61RcawRC5HaTUvuetU2BwABTiQBVheU2R');
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
});