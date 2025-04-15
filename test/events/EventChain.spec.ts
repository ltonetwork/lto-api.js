import { expect } from 'chai';
import { EventChain, Event } from '../../src/events';
import { AccountFactoryED25519 } from '../../src/accounts';
import Binary from '../../src/Binary';
import { IEventChainJSON } from '../../src/types';
import { EVENT_CHAIN_V1, EVENT_CHAIN_V2 } from '../../src/events/EventChain';

describe('EventChain', () => {
  const account = new AccountFactoryED25519('T').createFromSeed('test');

  function createEventChain(): EventChain {
    const chain = new EventChain(account, '');

    const firstEvent = new Event({}, 'application/json', chain.latestHash);
    firstEvent.timestamp = 1519862400;
    firstEvent.signWith(account);
    chain.add(firstEvent);

    const secondEvent = new Event({}, 'application/json', chain.latestHash);
    secondEvent.timestamp = 1519882600;
    secondEvent.signWith(account);
    chain.add(secondEvent);

    return chain;
  }

  describe('#constructor', () => {
    it('should generate a correct hash from the id', () => {
      const chain = new EventChain('88ogHPi2jUyfTxKtPCwzDkt4EJYaBR8ArpCagb3XxssHrQ2jeAxQ7X74brbKYg2');

      expect(chain.id).to.eq('88ogHPi2jUyfTxKtPCwzDkt4EJYaBR8ArpCagb3XxssHrQ2jeAxQ7X74brbKYg2');
      expect(chain.networkId).to.eq('T');
      expect(chain.latestHash.base58).to.eq('GCY3dU689Tqb4GWZwMA1xjShXMfSas91wLwS5nTRdcdX');
    });
  });

  describe('#create', () => {
    it('should generate a valid chain id when initiated for an account with random nonce', () => {
      const chain = new EventChain(account);
      expect(chain.isCreatedBy(account)).to.be.true;
      expect(chain.networkId).to.eq('T');
    });

    it('should generate the correct chain id when initiated for an account with a nonce', () => {
      const chain = new EventChain(account, 'foo');

      expect(chain.id).to.eq('8F94V9UxaX2J66XF7fxCX4jAJ73Atg7ntX9ACiWkqAm9WuxA37muigAvBCvNfiY');
      expect(chain.networkId).to.eq('T');
      expect(chain.isCreatedBy(account)).to.be.true;

      expect(chain.latestHash.base58).to.eq('EJBLjZagHQHc9rfiaUjccypes8EfSnLAuAYdekiRPGmY');
    });
  });

  describe('#isCreatedBy', () => {
    it('returns true for the account that created the chain', () => {
      const chain = new EventChain('8F94V9UxaX2J66XF7fxCX4jAJ73Atg7ntX9ACiWkqAm9WuxA37muigAvBCvNfiY');
      expect(chain.isCreatedBy(account)).to.be.true;
    });

    it('returns true for the account that created the chain v1', () => {
      const chain = new EventChain('88ogHPi2jUyfTxKtPCwzDkt4EJYaBR8ArpCagb3XxssHrQ2jeAxQ7X74brbKYg2');
      expect(chain.isCreatedBy(account)).to.be.true;
    });

    it("returns false for an account that didn't create the chain", () => {
      const other = new AccountFactoryED25519('T').createFromSeed('other');

      const chain = new EventChain('88ogHPi2jUyfTxKtPCwzDkt4EJYaBR8ArpCagb3XxssHrQ2jeAxQ7X74brbKYg2');
      expect(chain.isCreatedBy(other)).to.be.false;
    });

    it('returns false with a mainnet account and a testnet event chain', () => {
      const other = new AccountFactoryED25519('L').createFromSeed('test');

      const chain = new EventChain('88ogHPi2jUyfTxKtPCwzDkt4EJYaBR8ArpCagb3XxssHrQ2jeAxQ7X74brbKYg2');
      expect(chain.isCreatedBy(other)).to.be.false;
    });
  });

  describe('#add(Event)', () => {
    it('should add a signed event', () => {
      const chain = createEventChain();

      const event = new Event({}, 'application/json', chain.latestHash);
      event.timestamp = 1519862400;
      event.signWith(account);

      chain.add(event);

      expect(chain.events).to.have.length(3);
      expect(chain.events[chain.events.length - 1]).to.eq(event);
      expect(chain.latestHash.base58).to.eq(event.hash.base58);
    });

    it('should add an unsigned event', () => {
      const chain = createEventChain();

      const event = new Event({}, 'application/json', chain.latestHash);
      chain.add(event);

      expect(chain.events).to.have.length(3);
      expect(chain.events[chain.events.length - 1]).to.eq(event);

      expect(() => chain.latestHash).to.throw('Event cannot be converted to binary: sign key not set');
    });

    it('should check that event fits the chain', () => {
      const chain = new EventChain(account);

      const event = new Event({}, 'application/json', 'GKot5hBsd81kMupNCXHaqbhv3huEbxAFMLnpcX2hniwn');
      event.timestamp = 1519862400;
      event.signWith(account);

      expect(() => chain.add(event)).to.throw(`Event doesn't fit onto the chain after ${chain.latestHash.base58}`);
    });

    it('should verify the signature of the event', () => {
      const chain = new EventChain(account);

      const event = new Event({}, 'application/json', chain.latestHash);
      event.timestamp = 1519862400;
      event.signWith(account);
      event.signature! = account.sign(''); // Set invalid signature

      expect(() => chain.add(event)).to.throw(`Invalid signature of event ${event.hash.base58}`);
    });

    it('should not be possible to add if last event is unsigned', () => {
      const chain = createEventChain();
      chain.add(new Event({}));

      expect(() => chain.add(new Event({}))).to.throw('Unable to add event: last event on chain is not signed');
    });
  });

  describe('chain versions', () => {
    it('should create a chain with version 1', () => {
      const chain = new EventChain('88phxa3aSjJFBTGQcxDVZ6gZJZ8vdj6hDAGymACg8Wd13yoenT2gwdsZkw4gZua');
      expect(chain.version).to.eq(EVENT_CHAIN_V1);
    });

    it('should set version to 1 for added events', () => {
      const chain = new EventChain('88phxa3aSjJFBTGQcxDVZ6gZJZ8vdj6hDAGymACg8Wd13yoenT2gwdsZkw4gZua');
      const event = new Event({});

      chain.add(event);
      expect((event as any).version).to.eq(EVENT_CHAIN_V1);
    });

    it('should create a chain with version 2', () => {
      const chain = new EventChain('8F94V9UxaX2J66XF7fxCX4jAJ73Atg7ntX9ACiWkqAm9WuxA37muigAvBCvNfiY');
      expect(chain.version).to.eq(EVENT_CHAIN_V2);
    });

    it('should create a chain with version 2 by default', () => {
      const chain = new EventChain(account);
      expect(chain.version).to.eq(EVENT_CHAIN_V2);
    });

    it('should set version to 2 for added events', () => {
      const chain = new EventChain(account);
      const event = new Event({});

      chain.add(event);
      expect((event as any).version).to.eq(EVENT_CHAIN_V2);
    });
  });

  describe('#add(EventChain)', () => {
    it('should add a full chain, skipping existing events', () => {
      const chain = createEventChain();

      const newChain = createEventChain();
      const event3 = new Event({ third: 3 }).addTo(newChain).signWith(account);
      const event4 = new Event({ fourth: 4 }).addTo(newChain).signWith(account);

      chain.add(newChain);

      // noinspection DuplicatedCode
      expect(chain.events).to.have.length(4);
      expect(chain.events[2].hash.hex).to.be.eq(event3.hash.hex);
      expect(chain.events[3].hash.hex).to.be.eq(event4.hash.hex);
    });

    it('should add a partial chain', () => {
      const chain = createEventChain();

      const newChain = createEventChain();
      const event3 = new Event({ third: 3 }).addTo(newChain).signWith(account);
      const event4 = new Event({ fourth: 4 }).addTo(newChain).signWith(account);

      const partial = newChain.startingWith(event3);
      chain.add(partial);

      expect(chain.events).to.have.length(4);
      expect(chain.events[2].hash.hex).to.be.eq(event3.hash.hex);
      expect(chain.events[3].hash.hex).to.be.eq(event4.hash.hex);
    });

    it("should not add a partial chain that doesn't fit", () => {
      const chain = createEventChain();

      const newChain = createEventChain();
      const event3 = new Event({ third: 3 }).addTo(newChain).signWith(account);
      const event4 = new Event({ fourth: 4 }).addTo(newChain).signWith(account);

      const partial = newChain.startingWith(event4);
      expect(() => chain.add(partial)).to.throw(
        `Events don't fit onto this chain: Event ${event3.hash.base58} not found`,
      );
    });

    it('show detect merge conflicts', () => {
      const chain = createEventChain();
      const firstEvent = chain.events[0];
      const secondEvent = chain.events[1];

      const newChain = new EventChain(account, '');
      newChain.add(firstEvent);
      const altEvent = new Event({ alt: 42 }).addTo(newChain).signWith(account);

      expect(() => chain.add(newChain)).to.throw(
        `Merge conflict: Mismatch after ${firstEvent.hash.base58} between ${secondEvent.hash.base58} and ${altEvent.hash.base58}`,
      );
    });
  });

  describe('#has()', () => {
    it('should return true if event is part of the chain', () => {
      const chain = createEventChain();
      const secondEvent = chain.events[1];

      expect(chain.has(secondEvent)).to.be.true;
      expect(chain.has(secondEvent.hash)).to.be.true;
    });

    it('should return false if event is not part of the chain', () => {
      const chain = createEventChain();

      expect(chain.has(Binary.fromBase58('GKot5hBsd81kMupNCXHaqbhv3huEbxAFMLnpcX2hniwn'))).to.be.false;
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
      expect(id).to.eq('9r5FmjeMuRguMc9NxAD6GkYGpWLPYhmnFqzRBgJ6F1NYWBD9CyuLFogjtuEVGQc');
    });
  });

  describe('#state', () => {
    it('should return initial state given no events on chain', () => {
      const chain = new EventChain('L1hGimV7Pp2CFNUnTCitqWDbk9Zng3r3uc66dAG6hLwEx');
      expect(chain.state.base58).to.eq('CxDM9oFvWGf2uFAhH7fhPNqVxyN3LqX1s2WSVkEwdceN');
    });

    it('should return the state of the latest event on chain', () => {
      const chain = createEventChain();
      expect(chain.state.base58).to.eq('3q7jchLkWkcCnWnGUtb9tw2hYAyrdVAvuXuvajLr2pwB');
    });

    it('should throw an error given missing signature', () => {
      const chain = new EventChain(account, '');
      const event = new Event({}, 'application/json', chain.latestHash);
      chain.add(event);
      expect(() => chain.state).to.throw('Unable to get state: last event on chain is not signed');
    });
  });

  describe('#isSigned', () => {
    it('should return false given at least one unsigned event', () => {
      const chain = new EventChain(account, '');
      const firstEvent = new Event({}, 'application/json', chain.latestHash);
      firstEvent.timestamp = 1519862400;
      firstEvent.signWith(account);
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
      const chain = new EventChain(account, '');
      const firstEvent = new Event({}, 'application/json', chain.latestHash);
      firstEvent.timestamp = 1519862400;
      firstEvent.signWith(account);
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
    it('should create a partial event chain', () => {
      const chain = createEventChain();
      const secondEvent = chain.events[1];
      const partial = chain.startingWith(secondEvent);

      expect(partial.id).to.eq(chain.id);
      expect(partial.events).to.have.length(1);
      expect(partial.events[0].hash).to.eq(secondEvent.hash);
    });

    it('return the whole chain when starting with the initial hash', () => {
      const chain = createEventChain();
      const emptyChain = new EventChain(chain.id);
      const partial = chain.startingWith(emptyChain.latestHash);

      expect(partial).to.eq(chain);
    });

    it('return the whole chain when starting with the first event', () => {
      const chain = createEventChain();
      const firstEvent = chain.events[0];
      const partial = chain.startingWith(firstEvent);

      expect(partial).to.eq(chain);
    });

    it('should throw an error given no events with given hex', () => {
      const chain = createEventChain();

      const randomEvent = new Event({}, 'application/json', chain.latestHash);
      randomEvent.timestamp = 1519882600;
      randomEvent.signWith(account);

      expect(() => chain.startingWith(randomEvent)).to.throw(
        `Event ${randomEvent.hash.hex} is not part of this event chain`,
      );
    });
  });

  describe('#startingAfter', () => {
    it('should create a partial event chain', () => {
      const chain = createEventChain();
      const firstEvent = chain.events[0];
      const secondEvent = chain.events[1];
      const partial = chain.startingAfter(firstEvent);

      expect(partial.id).to.eq(chain.id);
      expect(partial.events).to.have.length(1);
      expect(partial.events[0].hash).to.eq(secondEvent.hash);
    });

    it('return the whole chain when starting after the initial hash', () => {
      const chain = createEventChain();
      const emptyChain = new EventChain(chain.id);
      const partial = chain.startingAfter(emptyChain.latestHash);

      expect(partial).to.eq(chain);
    });

    it('should create an empty partial event chain after the last event', () => {
      const chain = createEventChain();
      const secondEvent = chain.events[1];
      const partial = chain.startingAfter(secondEvent);

      expect(partial.id).to.eq(chain.id);
      expect(partial.events).to.have.length(0);
      expect(partial.latestHash).to.eq(secondEvent.hash);
    });

    it('should throw an error given no events with given hex', () => {
      const chain = createEventChain();

      const randomEvent = new Event({}, 'application/json', chain.latestHash);
      randomEvent.timestamp = 1519882600;
      randomEvent.signWith(account);

      expect(() => chain.startingAfter(randomEvent)).to.throw(
        `Event ${randomEvent.hash.hex} is not part of this event chain`,
      );
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

      const states = [(chain as any).stateAt(0), (chain as any).stateAt(1)];

      const anchorMap = chain.anchorMap;

      expect(anchorMap.length).to.eq(2);
      expect(anchorMap[0].key.hex).to.eq(states[0].hex);
      expect(anchorMap[0].value.hex).to.eq(firstEvent.hash.hex);
      expect(anchorMap[0].signer).to.eq(account.address);
      expect(anchorMap[1].key.hex).to.eq(states[1].hex);
      expect(anchorMap[1].value.hex).to.eq(secondEvent.hash.hex);
      expect(anchorMap[1].signer).to.eq(account.address);
    });

    it('should return an anchor map given a partial chain', () => {
      const chain = createEventChain();
      const secondEvent = chain.events[1];
      const expectedKey = chain.anchorMap[1].key;

      const partialChain = chain.startingWith(secondEvent);
      expect(partialChain.isPartial()).to.be.true;
      expect(partialChain.events.length).to.be.eq(1);

      const anchorMap = partialChain.anchorMap;
      expect(anchorMap.length).to.eq(1);
      expect(anchorMap[0].key.hex).to.eq(expectedKey.hex);
      expect(anchorMap[0].value.hex).to.eq(secondEvent.hash.hex);
    });
  });

  describe('#validate', () => {
    let chain: EventChain;
    let event: Event;

    beforeEach(() => {
      chain = new EventChain(account, '');
      event = new Event({ foo: 'bar', color: 'red' }, 'application/json', chain.latestHash);
      event.timestamp = 1519882600;
    });

    it('throws error given no events to validate', () => {
      expect(() => chain.validate()).to.throw('No events on event chain');
    });

    it('throws error if genesis event is signed by other account', () => {
      const other = new AccountFactoryED25519('T').createFromSeed('other');
      event.signWith(other);
      chain.add(event);

      expect(() => chain.validate()).to.throw(`Genesis event is not signed by chain creator`);
    });

    it('throws error given invalid hash on any event', () => {
      event.signWith(account);
      chain.add(event);

      // The hash is stored when signing, so modify the event after signing will result in an incorrect hash.
      event.timestamp = event.timestamp! - 10;

      expect(() => chain.validate()).to.throw(`Invalid hash of event ${event.hash.base58}`);
    });

    it('throws error given any unsigned event', () => {
      event.signWith(account);
      chain.add(event);
      const secondEvent = new Event({ bar: 'foo' }, 'application/json', chain.latestHash);
      chain.add(secondEvent);

      expect(() => chain.validate()).to.throw(`Last event is not signed`);
    });

    it('throws error given invalid signature on any event', () => {
      event.signWith(account);
      chain.add(event);

      event.signature! = account.sign(new Binary());
      expect(() => chain.validate()).to.throw(`Invalid signature of event ${event.hash.base58}`);
    });

    it('throws error given a partial chain with mismatching previous event', () => {
      event.signWith(account);
      chain.add(event);
      const secondEvent = new Event({ bar: 'foo' }, 'application/json', chain.latestHash);
      secondEvent.signWith(account);
      chain.add(secondEvent);
      const randomEvent = new Event({}, 'application/json', chain.latestHash.reverse());
      randomEvent.signWith(account);
      chain.events[1] = randomEvent;

      expect(() => chain.validate()).to.throw(`Event ${randomEvent.hash.base58} doesn't fit onto the chain`);
    });

    it('validates a valid event chain', () => {
      event.signWith(account);
      chain.add(event);
      const secondEvent = new Event({ bar: 'foo' }, 'application/json', chain.latestHash);
      secondEvent.signWith(account);
      chain.add(secondEvent);

      expect(() => chain.validate()).to.not.throw;
    });
  });

  describe('#from', () => {
    const emptyChainJSON: IEventChainJSON = {
      id: '2dZKMnHHsM1MGqTPZ5p3NmmGmAFE4hYFtMwb2e6tGVDMGZT13cBomKoo8DLEWh',
      events: [],
    };

    const partialChainJSON: IEventChainJSON = {
      id: '2dZKMnHHsM1MGqTPZ5p3NmmGmAFE4hYFtMwb2e6tGVDMGZT13cBomKoo8DLEWh',
      events: [
        {
          hash: 'BRFnaH3UFnABQ1gV1SvT9PLo5ZMFzH7NhqDSgyn1z8wD',
          state: '6CbXqFFiQfmMGgKfm2Rwzschmj8A3N6GpxfUzBCHcdip',
        },
        {
          timestamp: 1519883600,
          previous: 'BRFnaH3UFnABQ1gV1SvT9PLo5ZMFzH7NhqDSgyn1z8wD',
          signKey: {
            keyType: 'ed25519',
            publicKey: '2KduZAmAKuXEL463udjCQkVfwJkBQhpciUC4gNiayjSJ',
          },
          signature: '2hqLhbmh2eX2WhAgbwHhBZqzdpFcjWBYYN5WBj8zcYVKzVbnVH7mESCC9c9acihxWFwfvufnFYxxgFMgJPbpbU4N',
          hash: '9Y9DhjXHdrsUE93TZzSAYBWZS5TDWWNKKh2mihqRCGXh',
          mediaType: 'application/json',
          data: 'base64:eyJmb28iOiJiYXIiLCJjb2xvciI6ImdyZWVuIn0=',
        },
        {
          timestamp: 1519884600,
          previous: '9Y9DhjXHdrsUE93TZzSAYBWZS5TDWWNKKh2mihqRCGXh',
          signKey: {
            keyType: 'ed25519',
            publicKey: '2KduZAmAKuXEL463udjCQkVfwJkBQhpciUC4gNiayjSJ',
          },
          signature: 'BDtUgUJRmbumMMw3V35v7AJrnJ954cBVYQDPyyMc1Hx2x5LZYZkByuUzNJ2zvUWUhCUL3PJF86FQE6WFyQ7VCZU',
          hash: 'C2TsRTTsj7V923RQnEARYL596AXvccd1np32N9of4FaP',
          mediaType: 'application/json',
          data: 'base64:eyJmb28iOiJiYXIiLCJjb2xvciI6ImJsdWUifQ==',
        },
      ],
    };

    const fullChainJSON: IEventChainJSON = {
      id: '2dZKMnHHsM1MGqTPZ5p3NmmGmAFE4hYFtMwb2e6tGVDMGZT13cBomKoo8DLEWh',
      events: [
        {
          timestamp: 1519882600,
          previous: 'A332JTKSBZipjXxjC1xPxQoheF83WkEBMwLYaYs8yUBa',
          signKey: {
            keyType: 'ed25519',
            publicKey: '2KduZAmAKuXEL463udjCQkVfwJkBQhpciUC4gNiayjSJ',
          },
          signature: '4xn3xqLFXDLVtUjyKXAjTVGfjWkbCbtyQxFSVoYGLRzePGeyRAeEU7a29ZFztgD3ifwBBMWv9T51ecY2ZBNyWvXV',
          hash: 'BRFnaH3UFnABQ1gV1SvT9PLo5ZMFzH7NhqDSgyn1z8wD',
          mediaType: 'application/json',
          data: 'base64:eyJmb28iOiJiYXIiLCJjb2xvciI6InJlZCJ9',
        },
        {
          timestamp: 1519883600,
          previous: 'BRFnaH3UFnABQ1gV1SvT9PLo5ZMFzH7NhqDSgyn1z8wD',
          signKey: {
            keyType: 'ed25519',
            publicKey: '2KduZAmAKuXEL463udjCQkVfwJkBQhpciUC4gNiayjSJ',
          },
          signature: '2hqLhbmh2eX2WhAgbwHhBZqzdpFcjWBYYN5WBj8zcYVKzVbnVH7mESCC9c9acihxWFwfvufnFYxxgFMgJPbpbU4N',
          hash: '9Y9DhjXHdrsUE93TZzSAYBWZS5TDWWNKKh2mihqRCGXh',
          mediaType: 'application/json',
          data: 'base64:eyJmb28iOiJiYXIiLCJjb2xvciI6ImdyZWVuIn0=',
        },
        {
          timestamp: 1519884600,
          previous: '9Y9DhjXHdrsUE93TZzSAYBWZS5TDWWNKKh2mihqRCGXh',
          signKey: {
            keyType: 'ed25519',
            publicKey: '2KduZAmAKuXEL463udjCQkVfwJkBQhpciUC4gNiayjSJ',
          },
          signature: 'BDtUgUJRmbumMMw3V35v7AJrnJ954cBVYQDPyyMc1Hx2x5LZYZkByuUzNJ2zvUWUhCUL3PJF86FQE6WFyQ7VCZU',
          hash: 'C2TsRTTsj7V923RQnEARYL596AXvccd1np32N9of4FaP',
          mediaType: 'application/json',
          data: 'base64:eyJmb28iOiJiYXIiLCJjb2xvciI6ImJsdWUifQ==',
        },
      ],
    };

    it('should parse chain with no events and set id', () => {
      const chain = EventChain.from(emptyChainJSON);
      expect(chain.id).to.be.eq('2dZKMnHHsM1MGqTPZ5p3NmmGmAFE4hYFtMwb2e6tGVDMGZT13cBomKoo8DLEWh');
      expect(chain.events.length).to.be.eq(0);
    });

    describe('partial chain', () => {
      it('should set the partial property given partial chain and shift the partial event', () => {
        expect(partialChainJSON.events.length).to.be.eq(3);
        const partialChain = EventChain.from(partialChainJSON);
        expect(partialChainJSON.events.length).to.be.eq(2);
        expect(partialChain.id).to.be.eq('2dZKMnHHsM1MGqTPZ5p3NmmGmAFE4hYFtMwb2e6tGVDMGZT13cBomKoo8DLEWh');
        expect(partialChain.isPartial()).to.be.true;
      });

      it('should parse the json events properly', () => {
        const chain = EventChain.from(partialChainJSON);
        const events = chain.events;
        expect(events.length).to.be.eq(2);
        expect(events[0].previous!.base58).to.be.eq('BRFnaH3UFnABQ1gV1SvT9PLo5ZMFzH7NhqDSgyn1z8wD');
        expect(events[1].previous!.base58).to.be.eq('9Y9DhjXHdrsUE93TZzSAYBWZS5TDWWNKKh2mihqRCGXh');
      });
    });

    describe('full chain', () => {
      it('should not set the partial property given full chain', () => {
        const fullChain = EventChain.from(fullChainJSON);
        expect(fullChain.id).to.be.eq('2dZKMnHHsM1MGqTPZ5p3NmmGmAFE4hYFtMwb2e6tGVDMGZT13cBomKoo8DLEWh');
        expect(fullChain.isPartial()).to.be.false;
      });

      it('should parse the json events properly', () => {
        const chain = EventChain.from(fullChainJSON);
        const events = chain.events;
        expect(events.length).to.be.eq(3);
        expect(events[0].previous!.base58).to.be.eq('A332JTKSBZipjXxjC1xPxQoheF83WkEBMwLYaYs8yUBa');
        expect(events[1].previous!.base58).to.be.eq('BRFnaH3UFnABQ1gV1SvT9PLo5ZMFzH7NhqDSgyn1z8wD');
        expect(events[2].previous!.base58).to.be.eq('9Y9DhjXHdrsUE93TZzSAYBWZS5TDWWNKKh2mihqRCGXh');
      });
    });
  });

  describe('#toJSON', () => {
    let chain: EventChain;

    before(() => {
      chain = new EventChain(account, '');

      const firstEvent = new Event({}, 'application/json', chain.latestHash);
      firstEvent.timestamp = 1519862400;
      firstEvent.signWith(account);
      chain.add(firstEvent);

      const secondEvent = new Event({ foo: 'bar', color: 'red' }, 'application/json', chain.latestHash);
      secondEvent.timestamp = 1519882600;
      secondEvent.signWith(account);
      chain.add(secondEvent);
    });

    it('should return empty given no events', () => {
      const chainJSON = new EventChain(account, '').toJSON();

      expect(chainJSON).to.be.deep.eq({
        id: chain.id,
        events: [],
      });
    });

    it('should return full json object given id and events', () => {
      const chainJSON = chain.toJSON();

      expect(chainJSON).to.be.deep.eq({
        id: chain.id,
        events: [
          {
            data: 'base64:e30=',
            hash: chain.events[0].hash.base58,
            mediaType: 'application/json',
            attachments: [],
            previous: chain.events[0].previous!.base58,
            signKey: {
              keyType: 'ed25519',
              publicKey: '2KduZAmAKuXEL463udjCQkVfwJkBQhpciUC4gNiayjSJ',
            },
            signature: chain.events[0].signature!.base58,
            timestamp: 1519862400,
          },
          {
            data: 'base64:eyJmb28iOiJiYXIiLCJjb2xvciI6InJlZCJ9',
            hash: chain.events[1].hash.base58,
            mediaType: 'application/json',
            attachments: [],
            previous: chain.events[1].previous!.base58,
            signKey: {
              keyType: 'ed25519',
              publicKey: '2KduZAmAKuXEL463udjCQkVfwJkBQhpciUC4gNiayjSJ',
            },
            signature: chain.events[1].signature!.base58,
            timestamp: 1519882600,
          },
        ],
      });
    });

    it('should return json with stub event for partial chain', () => {
      const secondEvent = chain.events[1];
      const chainJSON = chain.startingWith(secondEvent).toJSON();
      const expectedState = chain.anchorMap[1].key;

      expect(chainJSON).to.be.deep.eq({
        id: chain.id,
        events: [
          {
            hash: chain.events[0].hash.base58,
            state: expectedState.base58,
          },
          {
            data: 'base64:eyJmb28iOiJiYXIiLCJjb2xvciI6InJlZCJ9',
            hash: chain.events[1].hash.base58,
            mediaType: 'application/json',
            attachments: [],
            previous: chain.events[1].previous!.base58,
            signKey: {
              keyType: 'ed25519',
              publicKey: '2KduZAmAKuXEL463udjCQkVfwJkBQhpciUC4gNiayjSJ',
            },
            signature: chain.events[1].signature!.base58,
            timestamp: 1519882600,
          },
        ],
      });
    });
  });
});
