import { expect } from 'chai';
import { EventChain, Event } from '../../src/events';
import { AccountFactoryED25519 } from '../../src/accounts';
import Binary from '../../src/Binary';
import * as sinon from 'sinon';
import { IEventJSON } from '../../interfaces';

describe('Event', () => {
  let event: Event;

  beforeEach(() => {
    event = new Event(new Binary(''), 'application/octet-stream', '72gRWx4C1Egqz9xvUBCYVdgh7uLc5kmGbjXFhiknNCTW');
    event.timestamp = 1519862400;
    event.signKey = {
      publicKey: Binary.fromBase58('FkU1XyfrCftc4pQKXCrrDyRLSnifX1SMvmx1CYiiyB3Y'),
      keyType: 'ed25519',
    };
  });

  afterEach(() => {
    event = null;
  });

  describe('#constructor', () => {
    it('should create an with previous', () => {
      expect(event.previous.base58).to.eq('72gRWx4C1Egqz9xvUBCYVdgh7uLc5kmGbjXFhiknNCTW');
    });

    it('should create an event with binary data', () => {
      event = new Event(new Binary('abc'));
      expect(event.mediaType).to.eq('application/octet-stream');
      expect(event.data.base58).to.eq(new Binary('abc').base58);
    });

    it('should create an event with json data', () => {
      event = new Event({ foo: 10, bar: 20 });
      expect(event.mediaType).to.eq('application/json');
      expect(event.data.base58).to.eq('PYTQZ4p2S57ZvFZGKbGYkB2ksv');
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
    it('should generate a event normal event message', () => {
      expect(event.toBinary()).to.deep.eq(
        Binary.fromBase58(
          '3MCbQyd2QXYWw64cjjWVyffE9ZfBBEUwgmZqeavE5Z9ejMJR834DzujgfxcE1KiVC4tvDpuy6rtvFN8nR6C8FhmL3jScMSdz4dmV873FVHuBiP6vPsAZbRoAexEFT7z5uyw1N',
        ),
      );
    });

    it('should throw an error when no signkey is set', () => {
      const event = new Event(new Binary());
      expect(() => event.toBinary()).to.throw('Event cannot be converted to binary: sign key not set');
    });
  });

  describe('#hash', () => {
    it('should generate a correct hash', () => {
      expect(event.hash.base58).to.eq('6FBgn23AioAGQtCHKM7zdQV7H5nq8iCimk62M2qhANGa');
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
      expect(event.signature.base58).to.eq(
        '5KpRyaiYTnrrdT3JUc5hyvW5tr3sqvgtrXZ9zErmmPyxAmouSio9vMP48ZJ7peYkaTRyRH4UD9JYEiJn6VxLpQiV',
      );
      expect(event.signKey.keyType).to.eq('ed25519');
      expect(event.signKey.publicKey.base58).to.eq('2od6By8qGe5DLYj7LD9djxVLBWVx5Dsy3P1TMRWdBPX6');

      expect(event.verifySignature()).to.be.true;
    });
  });

  describe('#addTo', () => {
    it('should call the addEvent method of the eventchain class', () => {
      const event = new Event({}, '');

      const chain = new EventChain('123');
      const stub = sinon.stub(chain, 'add').returns(event);

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
    let invalidEventJSON: IEventJSON;

    before(() => {
      eventJSON = JSON.parse(
        '{"timestamp":1519883600,' +
          '"previous":"BRFnaH3UFnABQ1gV1SvT9PLo5ZMFzH7NhqDSgyn1z8wD",' +
          '"signKey":{"keyType":"ed25519","publicKey":"2KduZAmAKuXEL463udjCQkVfwJkBQhpciUC4gNiayjSJ"},' +
          '"signature":"2hqLhbmh2eX2WhAgbwHhBZqzdpFcjWBYYN5WBj8zcYVKzVbnVH7mESCC9c9acihxWFwfvufnFYxxgFMgJPbpbU4N",' +
          '"hash":"9Y9DhjXHdrsUE93TZzSAYBWZS5TDWWNKKh2mihqRCGXh",' +
          '"mediaType":"application/json",' +
          '"data":"base64:eyJmb28iOiJiYXIiLCJjb2xvciI6ImdyZWVuIn0="}',
      );
      invalidEventJSON = JSON.parse(
        '{"timestamp":1519883600,' +
          '"previous":"BRFnaH3UFnABQ1gV1SvT9PLo5ZMFzH7NhqDSgyn1z8wD",' +
          '"signKey":{"keyType":"ed25519","publicKey":"2KduZAmAKuXEL463udjCQkVfwJkBQhpciUC4gNiayjSJ"},' +
          '"signature":"2hqLhbmh2eX2WhAgbwHhBZqzdpFcjWBYYN5WBj8zcYVKzVbnVH7mESCC9c9acihxWFwfvufnFYxxgFMgJPbpbU4N",' +
          '"hash":"9Y9DhjXHdrsUE93TZzSAYBWZS5TDWWNKKh2mihqRCGXh",' +
          '"mediaType":"application/json",' +
          '"data":"something-invalid"}',
      );
    });

    it('parses an event with all properties', () => {
      const event = Event.from(eventJSON);
      expect(event.timestamp).to.be.eq(1519883600);
      expect(event.previous.base58).to.be.eq('BRFnaH3UFnABQ1gV1SvT9PLo5ZMFzH7NhqDSgyn1z8wD');
      expect(event.signKey.keyType).to.be.eq('ed25519');
      expect(event.signKey.publicKey.base58).to.be.eq('2KduZAmAKuXEL463udjCQkVfwJkBQhpciUC4gNiayjSJ');
      expect(event.signature.base58).to.be.eq(
        '2hqLhbmh2eX2WhAgbwHhBZqzdpFcjWBYYN5WBj8zcYVKzVbnVH7mESCC9c9acihxWFwfvufnFYxxgFMgJPbpbU4N',
      );
      expect(event.hash.base58).to.be.eq('9Y9DhjXHdrsUE93TZzSAYBWZS5TDWWNKKh2mihqRCGXh');
      expect(event.mediaType).to.be.eq('application/json');
      expect(event.data.base58).to.be.eq('6bDXyuToeZ3maXzrgcLmPuShXbej97qn3NGZyDeC');
    });

    it('throws an error given invalid event JSON', () => {
      eventJSON.hash = 'invalid';
      eventJSON.previous = 'invalid';
      eventJSON.signature = 'invalid';
      eventJSON.data = 'invalid';
      expect(() => Event.from(eventJSON)).to.throw(
        'Unable to create event from JSON data: There is no character "l" in the Base58 sequence!',
      );
    });
  });
});
