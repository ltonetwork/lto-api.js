import { expect } from 'chai';
import { Binary } from '../src';
import { sha256 } from '@noble/hashes/sha256';

describe('Binary', () => {
  const testString = 'test';
  const base58String = '3yZe7d';
  const base64String = 'dGVzdA==';
  const hexString = '74657374';

  describe('constructor', () => {
    it('should construct Binary with number parameter', () => {
      const binary = new Binary(10);
      expect(binary).to.be.instanceOf(Binary);
      expect(binary.length).to.equal(10);
    });

    it('should construct Binary with string parameter', () => {
      const binary = new Binary(testString);
      expect(binary.toString()).to.equal(testString);
    });

    it('should construct Binary with ArrayLike parameter', () => {
      const arr = new Uint8Array([1, 2, 3, 4, 5]);
      const binary = new Binary(arr);
      expect(binary).to.deep.equal(arr);
    });
  });

  describe('from', () => {
    it('should create a Binary with string parameter', () => {
      const binary = Binary.from(testString);
      expect(binary).to.be.instanceOf(Binary);
      expect(binary.toString()).to.equal(testString);
    });

    it('should create a Binary with ArrayLike parameter', () => {
      const arr = new Uint8Array([1, 2, 3, 4, 5]);
      const binary = Binary.from(arr);
      expect(binary).to.be.instanceOf(Binary);
      expect(binary).to.deep.equal(arr);
    });

    it('should apply the map function', () => {
      const binary = Binary.from(['t', 'e', 's', 't'], (c) => c.charCodeAt(0));
      expect(binary).to.be.instanceOf(Binary);
      expect(binary.toString()).to.equal('test');
    });
  });

  describe('base58', () => {
    it('should return correct base58 string', () => {
      const binary = new Binary(testString);
      expect(binary.base58).to.equal(base58String);
    });
  });

  describe('base64', () => {
    it('should return correct base64 string', () => {
      const binary = new Binary(testString);
      expect(binary.base64).to.equal(base64String);
    });
  });

  describe('hex', () => {
    it('should return correct hex string', () => {
      const binary = new Binary(testString);
      expect(binary.hex).to.equal(hexString);
    });
  });

  describe('fromBase58', () => {
    it('should return correct Binary from base58 string', () => {
      const binary = Binary.fromBase58(base58String);
      expect(binary.toString()).to.equal(testString);
    });
  });

  describe('fromBase64', () => {
    it('should return correct Binary from base64 string', () => {
      const binary = Binary.fromBase64(base64String);
      expect(binary.toString()).to.equal(testString);
    });
  });

  describe('fromHex', () => {
    it('should return correct Binary from hex string', () => {
      const binary = Binary.fromHex(hexString);
      expect(binary.toString()).to.equal(testString);
    });
  });

  describe('fromMultibase', () => {
    it('should return correct Binary from base58 multibase string', () => {
      const multibaseString = 'z' + base58String;
      const binary = Binary.fromMultibase(multibaseString);
      expect(binary.toString()).to.equal(testString);
    });

    it('should return correct Binary from base64 multibase string', () => {
      const multibaseString = 'm' + base64String;
      const binary = Binary.fromMultibase(multibaseString);
      expect(binary.toString()).to.equal(testString);
    });

    it('should return correct Binary from hex multibase string', () => {
      const multibaseString = 'f' + hexString;
      const binary = Binary.fromMultibase(multibaseString);
      expect(binary.toString()).to.equal(testString);
    });

    it('should throw an error for unsupported multi-base encoding', () => {
      const unsupportedMultibaseString = 'a' + base64String;
      expect(() => Binary.fromMultibase(unsupportedMultibaseString)).to.throw('Unsupported multi-base encoding: a');
    });
  });

  describe('fromInt16', () => {
    it('should create a Binary instance from a 16-bit integer', () => {
      const binary = Binary.fromInt16(12345);
      expect([...binary]).to.deep.equal([48, 57]);
    });
  });

  describe('fromInt32', () => {
    it('should create a Binary instance from a 32-bit integer', () => {
      const binary = Binary.fromInt32(1234567890);
      expect([...binary]).to.deep.equal([73, 150, 2, 210]);
    });
  });

  describe('concat', () => {
    it('should concatenate Binary, Uint8Array, and numeric array instances', () => {
      const binary = new Binary([1, 2]);
      const array = new Uint8Array([3, 4]);
      const numericArray = [5, 6];

      const result = Binary.concat(binary, array, numericArray);

      expect(result).to.be.instanceOf(Binary);
      expect([...result]).to.deep.equal([1, 2, 3, 4, 5, 6]);
    });
  });

  describe('slice', () => {
    it('should slice the binary', () => {
      const binary = new Binary('test');
      const slicedBinary = binary.slice(1, 3);
      expect(slicedBinary.toString()).to.equal('es');
    });
  });

  describe('reverse', () => {
    it('should reverse the binary', () => {
      const binary = new Binary('bar');
      binary.reverse();
      expect(binary.toString()).to.equal('rab');
    });
  });

  describe('toReversed', () => {
    it('should not mutate the original binary', () => {
      const binary = new Binary('bar');
      const reversed = binary.toReversed();

      expect(reversed.toString()).to.equal('rab');
      expect(binary.toString()).to.equal('bar'); // check that original binary is not mutated
    });
  });

  describe('hash', () => {
    it('should return a Binary with the sha256 hash', () => {
      const binary = new Binary(testString);
      const hash = binary.hash();

      expect(hash).to.be.instanceOf(Binary);
      expect(hash).to.deep.equal(sha256(testString));
    });
  });
});
