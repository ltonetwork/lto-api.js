import { expect } from 'chai';
import { EventChain, Event } from '../../src/events';
import { AccountFactoryED25519 } from '../../src/accounts';
import Binary from "../../src/Binary";

describe('EventChain', () => {
  const account = new AccountFactoryED25519("T").createFromSeed("test");

  function createEventChain(): EventChain {
    const chain = EventChain.create(account, '');

    const firstEvent = new Event({}, 'application/json', chain.latestHash);
    firstEvent.timestamp = 1519862400;
    firstEvent.signWith(account)
    chain.add(firstEvent);

    const secondEvent = new Event({}, 'application/json', chain.latestHash);
    secondEvent.timestamp = 1519882600;
    secondEvent.signWith(account);
    chain.add(secondEvent);

    return chain;
  }

  describe('#constructor', () => {
    it('should generate a correct hash from the id', () => {
      const chain = new EventChain('L1hGimV7Pp2CFNUnTCitqWDbk9Zng3r3uc66dAG6hLwEx');

      expect(chain.id).to.eq('L1hGimV7Pp2CFNUnTCitqWDbk9Zng3r3uc66dAG6hLwEx');
      expect(chain.latestHash.base58).to.eq('9HM1ykH7AxLgdCqBBeUhvoTH4jkq3zsZe4JGTrjXVENg');
    });
  });

  describe('#create', () => {
    it('should generate a valid chain id when initiated for an account with random nonce', () => {
      const chain = EventChain.create(account, '');
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
      const chain = EventChain.create(account, '');

      const data = {
        foo: 'bar',
        color: 'red'
      };

      event = new Event(data, 'application/json', chain.latestHash);
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
      const chain = createEventChain();
      expect(chain.subject.base58).to.eq('32rhhbgAZnUs85rxSYCcqZbPfmBNQYR3WmL7WadT1G16');
    });

    it('should throw an error given missing signature', () => {
      const chain = EventChain.create(account, '');
      const event = new Event({});
      chain.add(event);

      expect(() => chain.subject).to.throw('Unable to get subject: latest event is not signed');
    });
  });

  describe('#isSigned', () => {
    it('should return false given at least one unsigned event', () => {
      const chain = EventChain.create(account, '');
      const firstEvent = new Event({}, 'application/json', chain.latestHash);
      firstEvent.timestamp = 1519862400;
      firstEvent.signWith(account)
      chain.add(firstEvent);

      expect(chain.isSigned()).to.be.true;

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
      const chain = EventChain.create(account, '');
      const firstEvent = new Event({}, 'application/json', chain.latestHash);
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

    it('should return false given a full chain', () => {
      const chain = createEventChain();
      expect(chain.isPartial()).to.be.false;
    });

    it('should return true given a partial (sub) chain', () => {
      const chain = createEventChain();
      const secondEvent = chain.events[1];

      const partialChain = chain.startingWith(secondEvent);
      expect(partialChain.isPartial()).to.be.true;
    });
  });

  describe('#startingWith', () => {
    it('should throw an error given no events with given hex', () => {
      const chain = createEventChain();

      const randomEvent = new Event({}, 'application/json', chain.latestHash);
      randomEvent.timestamp = 1519882600;
      randomEvent.signWith(account);

      expect(() => chain.startingWith(randomEvent))
        .to.throw(`Event ${randomEvent.hash.hex} is not part of this event chain`);
    });

    it('should return the final event given a call with final event', () => {
      const chain = createEventChain();
      const secondEvent = chain.events[1];

      expect(chain.startingWith(secondEvent).events[0].hash).to.eq(secondEvent.hash);
    });
  });

  describe('#anchorMap', () => {
    it('should return an empty map given no events', () => {
      const chain = new EventChain('L1hGimV7Pp2CFNUnTCitqWDbk9Zng3r3uc66dAG6hLwEx');

      expect(chain.anchorMap).to.have.length(0);
    });

    it('should return an anchor map given a full chain', () => {
      const chain = createEventChain();
      const firstEvent = chain.events[0];
      const secondEvent = chain.events[1];

      const subjects = [
        Binary.fromBase58(chain.id).reverse().hash(),
        firstEvent.signature.hash(),
      ];

      const anchorMap = chain.anchorMap;

      expect(anchorMap.length).to.eq(2);
      expect(anchorMap[0].key.hex).to.eq(subjects[0].hex);
      expect(anchorMap[0].value.hex).to.eq(firstEvent.hash.hex);
      expect(anchorMap[1].key.hex).to.eq(subjects[1].hex);
      expect(anchorMap[1].value.hex).to.eq(secondEvent.hash.hex);
    });

    it('should return an anchor map given a partial chain', () => {
      const chain = createEventChain();
      const firstEvent = chain.events[0];
      const secondEvent = chain.events[1];

      const partialChain = chain.startingWith(secondEvent);
      expect(partialChain.isPartial()).to.be.true;
      expect(partialChain.events.length).to.be.eq(1);

      const anchorMap = partialChain.anchorMap;
      expect(anchorMap.length).to.eq(1);
      expect(anchorMap[0].key.hex).to.eq(firstEvent.signature.hash().hex);
      expect(anchorMap[0].value.hex).to.eq(secondEvent.hash.hex);
    });
  });

  describe('#toJSON', () => {
    let chain: EventChain;

    before(() => {
      chain = EventChain.create(account, '');

      const firstEvent = new Event({}, 'application/json', chain.latestHash);
      firstEvent.timestamp = 1519862400;
      firstEvent.signWith(account);
      chain.add(firstEvent);

      const secondEvent = new Event({ foo: 'bar', color: 'red' }, 'application/json', chain.latestHash);
      secondEvent.timestamp = 1519882600;
      secondEvent.signWith(account)
      chain.add(secondEvent);
    })

    it('should return empty given no events', () => {
      const chainJSON = EventChain.create(account, '').toJSON();

      expect(chainJSON).to.be.deep.eq({
        "id": "2dZKMnHHsM1MGqTPZ5p3NmmGmAFE4hYFtMwb2e6tGVDMGZT13cBomKoo8DLEWh",
        "events": []
      });
    });

    it('should return full json object given id and events', () => {
      const chainJSON = chain.toJSON();

      expect(chainJSON).to.be.deep.eq({
        "id": "2dZKMnHHsM1MGqTPZ5p3NmmGmAFE4hYFtMwb2e6tGVDMGZT13cBomKoo8DLEWh",
        "events": [
          {
            "data": "base64:e30=",
            "hash": "4tkSiAf3F2XdmMwLgQuJsLAy7FPu93kGPXpbsawSYgym",
            "mediaType": "application/json",
            "previous": "A332JTKSBZipjXxjC1xPxQoheF83WkEBMwLYaYs8yUBa",
            "signKey": {
              "keyType": "ed25519",
              "publicKey": "2KduZAmAKuXEL463udjCQkVfwJkBQhpciUC4gNiayjSJ",
            },
            "signature": chain.events[0].signature.base58,
            "timestamp": 1519862400
          },
          {
            "data": "base64:eyJmb28iOiJiYXIiLCJjb2xvciI6InJlZCJ9",
            "hash": "4KUTJAW1xeM9hnL8MzwturaFgsykvdGqHPmJ16PwTAHW",
            "mediaType": "application/json",
            "previous": "4tkSiAf3F2XdmMwLgQuJsLAy7FPu93kGPXpbsawSYgym",
            "signKey": {
              "keyType": "ed25519",
              "publicKey": "2KduZAmAKuXEL463udjCQkVfwJkBQhpciUC4gNiayjSJ",
            },
            "signature": chain.events[1].signature.base58,
            "timestamp": 1519882600
          }
        ]
      });
    });

    it('should return json with stub event for partial chain', () => {
      const secondEvent = chain.events[1];
      const chainJSON = chain.startingWith(secondEvent).toJSON();

      expect(chainJSON).to.be.deep.eq({
        "id": "2dZKMnHHsM1MGqTPZ5p3NmmGmAFE4hYFtMwb2e6tGVDMGZT13cBomKoo8DLEWh",
        "events": [
          {
            "hash": "4tkSiAf3F2XdmMwLgQuJsLAy7FPu93kGPXpbsawSYgym",
            "subject": chain.events[0].signature.hash().base58,
          },
          {
            "data": "base64:eyJmb28iOiJiYXIiLCJjb2xvciI6InJlZCJ9",
            "hash": "4KUTJAW1xeM9hnL8MzwturaFgsykvdGqHPmJ16PwTAHW",
            "mediaType": "application/json",
            "previous": "4tkSiAf3F2XdmMwLgQuJsLAy7FPu93kGPXpbsawSYgym",
            "signKey": {
              "keyType": "ed25519",
              "publicKey": "2KduZAmAKuXEL463udjCQkVfwJkBQhpciUC4gNiayjSJ",
            },
            "signature": chain.events[1].signature.base58,
            "timestamp": 1519882600
          }
        ]
      });
    });
  });
});
