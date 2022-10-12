import { expect } from 'chai';
import { EventChain, Event } from '../../src/events';
import { AccountFactoryED25519 } from '../../src/accounts';
import Binary from "../../src/Binary";
import * as sinon from 'sinon';
import converters from "../../src/libs/converters";

describe('Event', () => {
  let event: Event;

  beforeEach(() => {
    event = new Event(new Binary(''), "application/octet-stream", '72gRWx4C1Egqz9xvUBCYVdgh7uLc5kmGbjXFhiknNCTW');
    event.timestamp = 1519862400;
    event.signKey = {
      publicKey: Binary.fromBase58('FkU1XyfrCftc4pQKXCrrDyRLSnifX1SMvmx1CYiiyB3Y'),
      keyType: "ed25519",
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
      event = new Event({"foo": 10, "bar": 20});
      expect(event.mediaType).to.eq('application/json');
      expect(event.data.base58).to.eq('PYTQZ4p2S57ZvFZGKbGYkB2ksv');
    });
  });

  describe('#toBinary', () => {
    it('should generate a event normal event message', () => {
      expect(event.toBinary()).to.deep.eq(Binary.fromBase58('XrkbS4dZyK1tgD9YtKTxS58WagTmuu6bPLDqPdytL4mseG8bzyo1tEpGR7LjyFKfGzsFR22r4QeDQejJwgUaAPXW1Pgrs5Hn5DgyrTHDoa8qVX5HobQ5pbYxJVNuUh9fGzx'));
    });

    it('should throw an error when no signkey is set', () => {
      const event = new Event(new Binary());
      expect(() => event.toBinary()).to.throw('Sign key not set');
    });
  });

  describe('#hash', () => {
    it('should generate a correct hash', () => {
      expect(event.hash.base58).to.eq('373AsfttQVFT5G9pNVTpShzHT55LarnsVgoaHLnimXqU');
    });
  });

  describe('#signWith', () => {
    it('should generate a correct signature', () => {
      const data = {
        foo: 'bar',
        color: 'red'
      };
      event = new Event(data, 'application/json', '72gRWx4C1Egqz9xvUBCYVdgh7uLc5kmGbjXFhiknNCTW');
      event.timestamp = 1519862400;

      const account = new AccountFactoryED25519('T').createFromSeed('seed');

      const res = event.signWith(account);
      expect(res).to.eq(event);
      expect(event.signature.base58).to.eq('5GHfmXcLSMZkAfsXhsNchYJCj7KHsFoj1X7fAbQaCF8m9bcyw7DdezJ2sYLsdyMfDS3kj1DUU1S16EzH5Xnezri4');
      expect(event.signKey.keyType).to.eq('ed25519');
      expect(event.signKey.publicKey).to.eq('2od6By8qGe5DLYj7LD9djxVLBWVx5Dsy3P1TMRWdBPX6');

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
});
