import { expect } from 'chai';
import { EventChain, Event } from '../../src/events';
import { AccountFactoryED25519 } from '../../src/accounts';
import Binary from "../../src/Binary";
import * as sinon from 'sinon';

describe('Event', () => {
  const account = new AccountFactoryED25519("T").createFromSeed("test");
  let event: Event;

  beforeEach(() => {
    event = new Event(new Binary(''), "application/octet-stream", '72gRWx4C1Egqz9xvUBCYVdgh7uLc5kmGbjXFhiknNCTW');
    event.timestamp = 1519862400;
    event.signkey = Binary.fromBase58('FkU1XyfrCftc4pQKXCrrDyRLSnifX1SMvmx1CYiiyB3Y');
  });

  afterEach(() => {
    event = null;
  });

  describe('#constructor', () => {
    it('should create an event with binary data', () => {
      event = new Event(new Binary('abc'));
      expect(event.mediaType).to.eq('application/octet-stream');
      expect(event.data.base58).to.eq(new Binary('abc').base58);
      expect(event.timestamp).to.be.a('number');
    });

    it('should create an event with json data', () => {
      event = new Event({"foo": 10, "bar": 20});
      event.timestamp = 1519862400;
      event.signkey = Binary.fromBase58('FkU1XyfrCftc4pQKXCrrDyRLSnifX1SMvmx1CYiiyB3Y');

      expect(event.mediaType).to.eq('application/json');
      expect(event.data).to.eq(Binary.fromBase58('HeFMDcuveZQYtBePVUugLyWtsiwsW4xp7xKdv'));
      expect(event.timestamp).to.be.a('number');
      expect(event).to.have.property('previous', '72gRWx4C1Egqz9xvUBCYVdgh7uLc5kmGbjXFhiknNCTW');
    });

    it('should create an with previous', () => {
      expect(event.mediaType).to.eq('application/octet-stream');
      expect(event.data).to.eq(Binary.fromBase58('HeFMDcuveZQYtBePVUugLyWtsiwsW4xp7xKdv'));
      expect(event.timestamp).to.eq(1519862400)
      expect(event).to.have.property('previous', '72gRWx4C1Egqz9xvUBCYVdgh7uLc5kmGbjXFhiknNCTW');
    });
  });

  describe('#toBinary', () => {
    it('should generate a event normal event message', () => {
      expect(event.toBinary()).to.eq(Binary.fromBase58(''));
    });

    it('should throw an error when no signkey is set', () => {
      const event = new Event(new Binary());
      expect(event.toBinary).to.throw('First set signkey before creating message');
    });
  });

  describe('#hash', () => {
    it('should generate a correct hash', () => {
      expect(event.hash).to.eq('Bpq9rZt12Gv44dkXFw8RmLYzbaH2HBwPQJ6KihdLe5LG');
    });
  });

  describe.skip('verifySignature', () => {
    it('should verify a correctly signed event', () => {
      expect(event.verifySignature()).to.be.true;
    })
  });

  describe.skip('#signWith', () => {
    it('should call the sign event method of the account class', () => {
      const event = new Event({}, '');

      const account = new AccountFactoryED25519('T').create();
      const stub = sinon.stub(account, 'sign').returns(event);

      const res = event.signWith(account);
      expect(res).to.deep.eq(event);

      stub.restore();
      sinon.assert.calledWith(stub, event);
    });

    it('should generate a correct signature', () => {
      const data = {
        foo: 'bar',
        color: 'red'
      };
      event = new Event(data, '72gRWx4C1Egqz9xvUBCYVdgh7uLc5kmGbjXFhiknNCTW');
      event.timestamp = 1519862400;

      const account = new AccountFactoryED25519('T').createFromSeed('seed');

      const res = event.signWith(account);
      expect(res).to.have.property('signature', '2M5PtkUxFEoV8BAcTxaStBvkPTR1dVk4H7bN2dLppXaCN7iY3WrtqfCNhHyjn1m1BdKZhb3g7WKd59usgvM8Ms1x');
      expect(res).to.have.property('signkey', '2od6By8qGe5DLYj7LD9djxVLBWVx5Dsy3P1TMRWdBPX6');
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
