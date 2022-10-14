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
  });

  describe('#subject', () => {
    it('should return initialSubject given no events on chain', () => {
      const chain = new EventChain('L1hGimV7Pp2CFNUnTCitqWDbk9Zng3r3uc66dAG6hLwEx');
      expect(chain.subject.base58).to.eq('CxDM9oFvWGf2uFAhH7fhPNqVxyN3LqX1s2WSVkEwdceN');
    });

    it('should return the subject of the latest event on chain', () => {
      const chain = new EventChain('L1hGimV7Pp2CFNUnTCitqWDbk9Zng3r3uc66dAG6hLwEx');
      const firstEvent = new Event({}, 'application/json', '72gRWx4C1Egqz9xvUBCYVdgh7uLc5kmGbjXFhiknNCTW');
      firstEvent.timestamp = 1519862400;
      firstEvent.signWith(account)
      chain.add(firstEvent);

      const secondEvent = new Event({}, 'application/json', chain.latestHash);
      secondEvent.timestamp = 1519882600;
      secondEvent.signWith(account);
      chain.add(secondEvent);

      expect(chain.subject.base58).to.eq('J112U48ZRhGbpiA8J6hW2ensAWqUQpcxATzqLsaWuWmf');
    });
  });

  describe('#isSigned', () => {
    it('should return false given at least one unsigned event', () => {
      const chain = new EventChain('L1hGimV7Pp2CFNUnTCitqWDbk9Zng3r3uc66dAG6hLwEx');
      const firstEvent = new Event({}, 'application/json', '72gRWx4C1Egqz9xvUBCYVdgh7uLc5kmGbjXFhiknNCTW');
      firstEvent.timestamp = 1519862400;
      firstEvent.signWith(account)
      chain.add(firstEvent);

      const secondEvent = new Event({}, 'application/json', chain.latestHash);
      secondEvent.timestamp = 1519882600;
      chain.add(secondEvent);

      expect(chain.isSigned()).to.be.false;
    });

    it('should return true given no events on chain', () => {
      const chain = new EventChain('L1hGimV7Pp2CFNUnTCitqWDbk9Zng3r3uc66dAG6hLwEx');
      expect(chain.isSigned()).to.be.true;
    });

    it('should return true given all signed events', () => {
      const chain = new EventChain('L1hGimV7Pp2CFNUnTCitqWDbk9Zng3r3uc66dAG6hLwEx');
      const firstEvent = new Event({}, 'application/json', '72gRWx4C1Egqz9xvUBCYVdgh7uLc5kmGbjXFhiknNCTW');
      firstEvent.timestamp = 1519862400;
      firstEvent.signWith(account)
      chain.add(firstEvent);
      expect(chain.isSigned()).to.be.true;
    });
  });

  describe('#isPartial', () => {
    it('should return false given no events', () => {
      const chain = new EventChain('L1hGimV7Pp2CFNUnTCitqWDbk9Zng3r3uc66dAG6hLwEx');

      expect(chain.isPartial()).to.be.false;
    });

    it('should return true given a partial (sub) chain', () => {
      const chain = new EventChain('L1hGimV7Pp2CFNUnTCitqWDbk9Zng3r3uc66dAG6hLwEx');
      const firstEvent = new Event({}, 'application/json', '72gRWx4C1Egqz9xvUBCYVdgh7uLc5kmGbjXFhiknNCTW');
      firstEvent.timestamp = 1519862400;
      firstEvent.signWith(account)
      chain.add(firstEvent);

      const secondEvent = new Event({}, 'application/json', chain.latestHash);
      secondEvent.timestamp = 1519882600;
      secondEvent.signWith(account)
      chain.add(secondEvent);

      const partialChain = chain.startingWith(secondEvent.hash);
      expect(partialChain.isPartial()).to.be.true;
    });
  });

  describe('#startingWith', () => {
    it('should throw an error given no events with given hex', () => {
      const chain = new EventChain('L1hGimV7Pp2CFNUnTCitqWDbk9Zng3r3uc66dAG6hLwEx');
      const firstEvent = new Event({}, 'application/json', '72gRWx4C1Egqz9xvUBCYVdgh7uLc5kmGbjXFhiknNCTW');
      firstEvent.timestamp = 1519862400;
      firstEvent.signWith(account)
      chain.add(firstEvent);

      const secondEvent = new Event({}, 'application/json', chain.latestHash);
      secondEvent.timestamp = 1519882600;
      secondEvent.signWith(account)
      chain.add(secondEvent);

      const randomEvent = new Event({}, 'application/json', chain.latestHash);
      randomEvent.timestamp = 1519882600;
      randomEvent.signWith(account);

      expect(() => chain.startingWith(randomEvent.hash))
          .to
          .throw(`Event 505c50a4ac59d4e6f53ef91c4391109dc764869b396d0e23908efe3bad0887bc is not part of this event chain`);
    });

    it('should return the final event given a call with final event', () => {
      const chain = new EventChain('L1hGimV7Pp2CFNUnTCitqWDbk9Zng3r3uc66dAG6hLwEx');
      const firstEvent = new Event({}, 'application/json', '72gRWx4C1Egqz9xvUBCYVdgh7uLc5kmGbjXFhiknNCTW');
      firstEvent.timestamp = 1519862400;
      firstEvent.signWith(account)
      chain.add(firstEvent);

      const secondEvent = new Event({}, 'application/json', chain.latestHash);
      secondEvent.timestamp = 1519882600;
      secondEvent.signWith(account)
      chain.add(secondEvent);

      expect(chain.startingWith(secondEvent.hash).events[0].hash).to.eq(secondEvent.hash);
    });
  });

  describe('#anchorMap', () => {
    it('should return an empty map given no events', () => {
      const chain = new EventChain('L1hGimV7Pp2CFNUnTCitqWDbk9Zng3r3uc66dAG6hLwEx');

      expect(chain.anchorMap).to.have.length(0);
    });

    it('should shift out the subject of the first even given partial chain', () => {
      const chain = new EventChain('L1hGimV7Pp2CFNUnTCitqWDbk9Zng3r3uc66dAG6hLwEx');
      const firstEvent = new Event({}, 'application/json', '72gRWx4C1Egqz9xvUBCYVdgh7uLc5kmGbjXFhiknNCTW');
      firstEvent.timestamp = 1519862400;
      firstEvent.signWith(account)
      chain.add(firstEvent);

      const secondEvent = new Event({}, 'application/json', chain.latestHash);
      secondEvent.timestamp = 1519882600;
      secondEvent.signWith(account)
      chain.add(secondEvent);

      const subChain = chain.startingWith(secondEvent.hash);
      expect(subChain.isPartial()).to.be.true;
      expect(subChain.events.length).to.be.eq(1);

      const anchorMap = subChain.anchorMap;
      expect(anchorMap.length).to.eq(0);
    });
  });

  describe('#toJSON', () => {
    it('should return empty given no events', () => {
      const chain = new EventChain('L1hGimV7Pp2CFNUnTCitqWDbk9Zng3r3uc66dAG6hLwEx');
      const chainJSON = chain.toJSON();

      expect(chainJSON.id).to.be.eq(chain.id);
      expect(chainJSON.events.length).to.be.eq(0);
    });

    it('should return full json object given id and events', () => {
      const chain = new EventChain('L1hGimV7Pp2CFNUnTCitqWDbk9Zng3r3uc66dAG6hLwEx');
      const firstEvent = new Event({}, 'application/json', '72gRWx4C1Egqz9xvUBCYVdgh7uLc5kmGbjXFhiknNCTW');
      firstEvent.timestamp = 1519862400;
      firstEvent.signWith(account)
      chain.add(firstEvent);
      const data = {
        foo: 'bar',
        color: 'red'
      };
      const secondEvent = new Event(data, 'application/json', chain.latestHash);
      secondEvent.timestamp = 1519882600;
      secondEvent.signWith(account)
      chain.add(secondEvent);

      const chainJSON = chain.toJSON();
      expect(chainJSON.id).to.be.eq(chain.id);
      expect(chainJSON.events.length).to.be.eq(2);
      expect(chainJSON.events[0].hash).to.eq(firstEvent.hash.base58);
      expect(chainJSON.events[1].hash).to.eq(secondEvent.hash.base58);
    });
  });
});
