import { expect } from 'chai';
import crypto from '../../src/utils/crypto';
import base58 from '../../src/libs/base58';
import convert from '../../src/utils/convert';
import * as nacl from 'tweetnacl';


describe('crypto', () => {

  describe('#buildHash', () => {
    it('should generate a base58 hash', () => {
      const body = '{"hello": "world"}';
      const hash = crypto.buildHash(Uint8Array.from(convert.stringToByteArray(body)));
      expect(hash).to.eq('7S2DfZYtZeuXFCcHpUzz9X6M4kQW9WTmJgfAA9GbkgSL');
    });

    it('should generate a base64 hash', () => {
      const body = '{"hello": "world"}';
      const hash = crypto.buildHash(body, 'base64');
      expect(hash).to.eq('X48E9qOokqqrvdts8nOJRJN3OWDUoyWxBf7kbu9DBPE=');
    });
  });
});
