import { expect } from 'chai';
import { EventChain, Event } from '../../src/events';
import { AccountFactoryED25519 } from '../../src/accounts';
import Binary from '../../src/Binary';
import * as sinon from 'sinon';
import { IEventJSON } from '../../src/types';
import { EVENT_CHAIN_V1 } from '../../src/events/EventChain';

describe('Event', () => {
  let event: Event;

  beforeEach(() => {
    event = new Event(new Binary('test'), 'application/octet-stream', '72gRWx4C1Egqz9xvUBCYVdgh7uLc5kmGbjXFhiknNCTW');
    event.timestamp = 1519862400;
    event.signKey = {
      publicKey: Binary.fromBase58('FkU1XyfrCftc4pQKXCrrDyRLSnifX1SMvmx1CYiiyB3Y'),
      keyType: 'ed25519',
    };
  });

  describe('#constructor', () => {
    it('should create an with previous', () => {
      expect(event.previous!.base58).to.eq('72gRWx4C1Egqz9xvUBCYVdgh7uLc5kmGbjXFhiknNCTW');
    });

    it('should create an event with binary data', () => {
      event = new Event(new Binary('abc'));
      expect(event.mediaType).to.eq('application/octet-stream');
      expect(event.data).to.deep.eq(new Binary('abc'));
    });

    it('should create an event with json data', () => {
      event = new Event({ foo: 10, bar: 20 });
      expect(event.mediaType).to.eq('application/json');
      expect(event.data).to.deep.eq(new Binary('{"foo":10,"bar":20}'));
    });
  });

  describe('#addAttachment', () => {
    it('should add attachment', () => {
      event.addAttachment('test', new Binary('abc'));
      expect(event.attachments).to.deep.eq([
        { name: 'test', mediaType: 'application/octet-stream', data: new Binary('abc') },
      ]);
    });

    it('should add attachment with media type', () => {
      event.addAttachment('test', new Binary('abc'), 'text/plain');
      expect(event.attachments).to.deep.eq([{ name: 'test', mediaType: 'text/plain', data: new Binary('abc') }]);
    });

    it('should add attachment with json data', () => {
      event.addAttachment('test', { foo: 10, bar: 20 });
      expect(event.attachments).to.deep.eq([
        { name: 'test', mediaType: 'application/json', data: new Binary('{"foo":10,"bar":20}') },
      ]);
    });
  });

  describe('#parsedData', () => {
    it('should return json data', () => {
      event = new Event({ foo: 10, bar: 20 });
      expect(event.parsedData).to.deep.eq({ foo: 10, bar: 20 });
    });

    it('should throw an error for non-json data', () => {
      event = new Event(new Binary('abc'));
      expect(() => event.parsedData).to.throw('Unable to parse data with media type "application/octet-stream"');
    });
  });

  describe('#toBinary', () => {
    it('should generate binary', () => {
      expect(new Binary(event.toBinary()).hex).to.eq(
        '5994471abb01112afcc18159f6cc74b4f511b99806da59b3caf5a9c173cacfc501db262194419da2c83b4190bffe189b1e26753079369bb8e9fc46d47857730e2b000000005a97428000186170706c69636174696f6e2f6f637465742d73747265616d0004746573740000',
      );
    });

    it('should generate binary v1', () => {
      (event as any).version = EVENT_CHAIN_V1;

      expect(new Binary(event.toBinary()).hex).to.eq(
        '5994471abb01112afcc18159f6cc74b4f511b99806da59b3caf5a9c173cacfc501db262194419da2c83b4190bffe189b1e26753079369bb8e9fc46d47857730e2b000000005a9742806170706c69636174696f6e2f6f637465742d73747265616d74657374',
      );
    });

    it('should throw an error when no signkey is set', () => {
      const event = new Event(new Binary());
      expect(() => event.toBinary()).to.throw('Event cannot be converted to binary: sign key not set');
    });

    it('should generate binary with attachments', () => {
      event.addAttachment('test', new Binary('test'));
      event.addAttachment('test2', new Binary('test2'));

      expect(new Binary(event.toBinary()).hex).to.eq(
        '5994471abb01112afcc18159f6cc74b4f511b99806da59b3caf5a9c173cacfc501db262194419da2c83b4190bffe189b1e26753079369bb8e9fc46d47857730e2b000000005a97428000186170706c69636174696f6e2f6f637465742d73747265616d000474657374000200047465737400186170706c69636174696f6e2f6f637465742d73747265616d0004746573740005746573743200186170706c69636174696f6e2f6f637465742d73747265616d00057465737432',
      );
    });
  });

  describe('#hash', () => {
    it('should generate a correct hash', () => {
      expect(event.hash.base58).to.eq('8NFiTPwvFzFsvHnhMgQGyWY9L51m1JSpwUf5hAgwAyR3');
    });

    it('should return true when verifying the hash', () => {
      expect(event.verifyHash()).to.be.true;
    });

    it('should return false when verifying an incorrect hash', () => {
      (event as any)._hash = new Binary('').hash();
      expect(event.verifyHash()).to.be.false;
    });
  });

  describe('#signWith', () => {
    it('should generate a correct signature', () => {
      const data = {
        foo: 'bar',
        color: 'red',
      };
      event = new Event(data, 'application/json', '72gRWx4C1Egqz9xvUBCYVdgh7uLc5kmGbjXFhiknNCTW');
      event.timestamp = 1519862400;

      const account = new AccountFactoryED25519('T').createFromSeed('seed');

      const res = event.signWith(account);
      expect(res).to.eq(event);
      expect(event.signature!.base58).to.eq(
        '65x5nx5Hqfh3RSMYFwpRM7hXurJR8JkECBF5RRQWE4C1cMQTm6RVUQAnTNj2pVYqwsSC64PJ3CdsvMriysmKdj79',
      );
      expect(event.signKey!.keyType).to.eq('ed25519');
      expect(event.signKey!.publicKey.base58).to.eq('2od6By8qGe5DLYj7LD9djxVLBWVx5Dsy3P1TMRWdBPX6');

      expect(event.verifySignature()).to.be.true;
    });
  });

  describe('#addTo', () => {
    it('should call the addEvent method of the eventchain class', () => {
      const event = new Event({}, '');

      const chain = new EventChain('123');
      const stub = sinon.stub(chain, 'add').returns(chain);

      const res = event.addTo(chain);
      expect(res).to.deep.eq(event);

      stub.restore();
      sinon.assert.calledWith(stub, event);
    });
  });

  describe('#isSigned', () => {
    it('should return false given no signature', () => {
      const event = new Event({}, '');
      expect(event.isSigned()).to.be.false;
    });

    it('should return true given existing signature', () => {
      const data = {
        foo: 'bar',
        color: 'red',
      };
      event = new Event(data, 'application/json', '72gRWx4C1Egqz9xvUBCYVdgh7uLc5kmGbjXFhiknNCTW');
      const account = new AccountFactoryED25519('T').createFromSeed('seed');

      event.signWith(account);
      expect(event.isSigned()).to.be.true;
    });
  });

  describe('#from', () => {
    let eventJSON: IEventJSON;

    before(() => {
      eventJSON = {
        timestamp: 1519883600,
        previous: 'BRFnaH3UFnABQ1gV1SvT9PLo5ZMFzH7NhqDSgyn1z8wD',
        signKey: { keyType: 'ed25519', publicKey: '2KduZAmAKuXEL463udjCQkVfwJkBQhpciUC4gNiayjSJ' },
        signature: '2hqLhbmh2eX2WhAgbwHhBZqzdpFcjWBYYN5WBj8zcYVKzVbnVH7mESCC9c9acihxWFwfvufnFYxxgFMgJPbpbU4N',
        hash: '9Y9DhjXHdrsUE93TZzSAYBWZS5TDWWNKKh2mihqRCGXh',
        mediaType: 'application/json',
        data: 'base64:eyJmb28iOiJiYXIiLCJjb2xvciI6ImdyZWVuIn0=',
        attachments: [{ name: 'test', mediaType: 'text/plain', data: 'base64:Zm9v' }],
      };
    });

    it('parses an event with all properties', () => {
      const event = Event.from(eventJSON);
      expect(event.timestamp).to.be.eq(1519883600);
      expect(event.previous!.base58).to.be.eq('BRFnaH3UFnABQ1gV1SvT9PLo5ZMFzH7NhqDSgyn1z8wD');
      expect(event.signKey!.keyType).to.be.eq('ed25519');
      expect(event.signKey!.publicKey.base58).to.be.eq('2KduZAmAKuXEL463udjCQkVfwJkBQhpciUC4gNiayjSJ');
      expect(event.signature!.base58).to.be.eq(
        '2hqLhbmh2eX2WhAgbwHhBZqzdpFcjWBYYN5WBj8zcYVKzVbnVH7mESCC9c9acihxWFwfvufnFYxxgFMgJPbpbU4N',
      );
      expect(event.hash.base58).to.be.eq('9Y9DhjXHdrsUE93TZzSAYBWZS5TDWWNKKh2mihqRCGXh');
      expect(event.mediaType).to.be.eq('application/json');
      expect(event.data.base58).to.be.eq('6bDXyuToeZ3maXzrgcLmPuShXbej97qn3NGZyDeC');

      expect(event.attachments).to.have.length(1);
      expect(event.attachments[0].name).to.be.eq('test');
      expect(event.attachments[0].mediaType).to.be.eq('text/plain');
      expect(event.attachments[0].data).to.deep.eq(new Binary('foo'));
    });

    it('throws an error given invalid event JSON', () => {
      eventJSON.hash = 'invalid';
      eventJSON.previous = 'invalid';
      eventJSON.signature = 'invalid';
      eventJSON.data = 'invalid';
      expect(() => Event.from(eventJSON)).to.throw('Unable to create event from JSON data: Unknown letter: "l"');
    });
  });
});
