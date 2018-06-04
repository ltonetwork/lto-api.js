import { expect } from 'chai';
import { EventChain } from '../src/classes/EventChain';
import { Event } from '../src/classes/Event';
import { Account } from '../src/classes/Account';
import encoder from '../src/utils/encoder';
import * as sinon from 'sinon';

describe('Event', () => {

  let event;

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

      const message = event.getMessage();
      expect(message).to.eq(expected);
    });

    it('should throw an error when no body is set', () => {
      const event = new Event();
      expect(() => event.getMessage()).to.throw('Body unknown');
    });

    it('should throw an error when no signkey is set', () => {
      const event = new Event({
        foo: 'bar',
        color: 'red'
      });
      expect(() => event.getMessage()).to.throw('First set signkey before creating message');
    });
  });

  describe('#getHash', () => {
    it('should generate a correct hash', () => {
      expect(event.getHash()).to.eq('Bpq9rZt12Gv44dkXFw8RmLYzbaH2HBwPQJ6KihdLe5LG');
    });
  });

  describe('verifySignature', () => {
    it('should verify a correctly signed event', () => {
      event.signature = '258KnaZxcx4cA9DUWSPw8QwBokRGzFDQmB4BH9MRJhoPJghsXoAZ7KnQ2DWR7ihtjXzUjbsXtSeup4UDcQ2L6RDL';
      expect(event.verifySignature()).to.be.true;
    })
  });

  describe('#signWith', () => {
    it('should call the sign event method of the account class', () => {
      const event = new Event({}, '');

      const account = new Account();
      const stub = sinon.stub(account, 'signEvent').returns(event);

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

      const account = new Account();
      account.sign = {
        privateKey: encoder.decode('wJ4WH8dD88fSkNdFQRjaAhjFUZzZhV5yiDLDwNUnp6bYwRXrvWV8MJhQ9HL9uqMDG1n7XpTGZx7PafqaayQV8Rp'),
        publicKey: encoder.decode('FkU1XyfrCftc4pQKXCrrDyRLSnifX1SMvmx1CYiiyB3Y')
      };

      const res = event.signWith(account);
      expect(res).to.have.property('signature', '258KnaZxcx4cA9DUWSPw8QwBokRGzFDQmB4BH9MRJhoPJghsXoAZ7KnQ2DWR7ihtjXzUjbsXtSeup4UDcQ2L6RDL');
      expect(res).to.have.property('signkey', 'FkU1XyfrCftc4pQKXCrrDyRLSnifX1SMvmx1CYiiyB3Y');
    });
  });

  describe('#addTo', () => {
    it('should call the addEvent method of the eventchain class', () => {
      const event = new Event({}, '');

      const chain = new EventChain();
      const stub = sinon.stub(chain, 'addEvent').returns(event);

      const res = event.addTo(chain);
      expect(res).to.deep.eq(event);

      stub.restore();
      sinon.assert.calledWith(stub, event);
    });
  });
});