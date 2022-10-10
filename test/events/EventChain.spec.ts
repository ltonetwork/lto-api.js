import { expect } from 'chai';
import { EventChain, Event } from '../../src/events';
import { AccountFactoryED25519 } from '../../src/accounts';

describe('EventChain', () => {
  const account = new AccountFactoryED25519("T").createFromSeed("test");

  describe('#constructor', () => {
    it('should generate a correct hash from the id', () => {
      const chain = new EventChain('L1hGimV7Pp2CFNUnTCitqWDbk9Zng3r3uc66dAG6hLwEx');

      expect(chain.id).to.eq('L1hGimV7Pp2CFNUnTCitqWDbk9Zng3r3uc66dAG6hLwEx');
      expect(chain.latestHash.base58).to.eq('9HM1ykH7AxLgdCqBBeUhvoTH4jkq3zsZe4JGTrjXVENg');
    });
  });

  describe('#create', () => {
    it('should generate a valid chain id when initiated for an account with random nonce', () => {
      const chain = EventChain.create(account);
      expect(chain.isCreatedBy(account)).to.eq(true);
    });

    it('should generate the correct chain id when initiated for an account with a nonce', () => {
      const chain = EventChain.create(account, 'foo');

      expect(chain.id).to.eq('2cXeBSjad2Rdmtw9opJi2yGCWZtmkj1uYHYWTUxidjW9gnXrmXtyeZJe5Q5DiH');
      expect(chain.isCreatedBy(account)).to.eq(true);

      expect(chain.latestHash.base58).to.eq('FVQ4ehLbsnYHWMfyYowx29o74HsHMbEromxAstdvEars');
    });
  });

  describe('#add', () => {
    let event;

    beforeEach(() => {
      const data = {
        foo: 'bar',
        color: 'red'
      };

      event = new Event(data, 'application/json', '72gRWx4C1Egqz9xvUBCYVdgh7uLc5kmGbjXFhiknNCTW');
      event.timestamp = 1519862400;
      event.signWith(account)

      expect(event.verifySignature()).to.be.true;
    });

    it('should add an event and return the latest hash', () => {
      const chain = new EventChain('L1hGimV7Pp2CFNUnTCitqWDbk9Zng3r3uc66dAG6hLwEx');

      const data = {
        foo: 'bar',
        color: 'red'
      };

      event = new Event(data, 'application/json', '72gRWx4C1Egqz9xvUBCYVdgh7uLc5kmGbjXFhiknNCTW');
      event.timestamp = 1519862400;
      event.signWith(account)

      chain.add(event);

      expect(chain.latestHash.base58).to.eq(event.hash.base58);
    });

    it('should verify the signature of the event', () => {
      const chain = new EventChain('L1hGimV7Pp2CFNUnTCitqWDbk9Zng3r3uc66dAG6hLwEx');

      event.signature = account.sign('');
      expect(() => chain.add(event)).to.throw("Invalid signature of event");
    });
  });

  describe('#getDerivedId', () => {
    it('should generate a valid derived id with a random nonce', () => {
      const chain = new EventChain('L1hGimV7Pp2CFNUnTCitqWDbk9Zng3r3uc66dAG6hLwEx');
      const id = chain.createDerivedId();

      expect(chain.isDerivedId(id)).to.equal(true);
    });

    it('should generate a correct projection id with a set nonce', () => {
      const chain = new EventChain('L1hGimV7Pp2CFNUnTCitqWDbk9Zng3r3uc66dAG6hLwEx');
      const id = chain.createDerivedId('foo');

      expect(chain.isDerivedId(id)).to.equal(true);
      expect(id).to.eq('31VQR4AhK2bB2ueKiFhE7iCxFMBSasCK8YWrY9CJgigo6nric6nTPGnFz4iTXj');
    })
  })
});
