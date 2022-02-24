import { expect } from 'chai';
import { EventChain, Event } from '../../src/events';
import { AccountFactoryED25519 } from '../../src/accounts';
import * as sinon from 'sinon';

describe('Event', () => {

  let event: Event;

  beforeEach(() => {
    const data = {
      foo: 'bar',
      color: 'red'
    };
    event = new Event(data, '72gRWx4C1Egqz9xvUBCYVdgh7uLc5kmGbjXFhiknNCTW');
    event.timestamp = 1519862400;
    event.signkey = 'FkU1XyfrCftc4pQKXCrrDyRLSnifX1SMvmx1CYiiyB3Y';
  });

  afterEach(() => {
    event = null;
  });

  describe('#constructor', () => {
    it('should create a correct event object', () => {
      expect(event.body).to.eq('HeFMDcuveZQYtBePVUugLyWtsiwsW4xp7xKdv');
      expect(event.timestamp).to.be.a('number');
      expect(event).to.have.property('previous', '72gRWx4C1Egqz9xvUBCYVdgh7uLc5kmGbjXFhiknNCTW');
    });
  });

  describe('#getMessage', () => {
    it('should generate a event normal event message', () => {

      const expected = [
        "HeFMDcuveZQYtBePVUugLyWtsiwsW4xp7xKdv",
        '1519862400',
        "72gRWx4C1Egqz9xvUBCYVdgh7uLc5kmGbjXFhiknNCTW",
        "FkU1XyfrCftc4pQKXCrrDyRLSnifX1SMvmx1CYiiyB3Y"
      ].join('\n');

      expect(event.message).to.eq(expected);
    });

    it('should throw an error when no body is set', () => {
      const event = new Event();
      expect(() => event.message).to.throw('Body unknown');
    });

    it('should throw an error when no signkey is set', () => {
      const event = new Event({
        foo: 'bar',
        color: 'red'
      });
      expect(() => event.message).to.throw('First set signkey before creating message');
    });
  });

  describe('#getHash', () => {
    it('should generate a correct hash', () => {
      expect(event.hash).to.eq('Bpq9rZt12Gv44dkXFw8RmLYzbaH2HBwPQJ6KihdLe5LG');
    });
  });

  describe('#getBody', () => {
    it('should return a decoded body', () => {
      expect(event.getBody()).to.deep.eq({
        foo: 'bar',
        color: 'red'
      });
    })
  });

  describe.skip('verifySignature', () => {
    it('should verify a correctly signed event', () => {
      event.signature = '258KnaZxcx4cA9DUWSPw8QwBokRGzFDQmB4BH9MRJhoPJghsXoAZ7KnQ2DWR7ihtjXzUjbsXtSeup4UDcQ2L6RDL';
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

  describe('#getResourceVersion', () => {
    it('should generate a correct hash version', () => {
      expect(event.getResourceVersion()).to.eq('4RaPGFmq');
    })
  })
});
