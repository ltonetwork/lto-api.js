import { expect } from 'chai';
import crypto from '../src/utils/crypto';
import base58 from '../src/libs/base58';
import convert from '../src/utils/convert';
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

  describe('#buildKeyPair', () => {

    it('should generate the right keypair', () => {
      const phrase = 'turkey figure exercise invite talent angry raw opinion chicken tackle mean august bind chuckle time';
      const keyPair = crypto.buildKeyPair(phrase, false, true);

      expect(base58.encode(keyPair.privateKey)).to.eq('3Lm5bvaJFW7t68itw2PjMc71LxGaafShEwHwC284tCkDEvnBWP2AitxYirbF3qaCDhGDR32c7xCL3NcJZZXcSoF3');
      expect(base58.encode(keyPair.publicKey)).to.eq('Gp8A9bkGdkKmdzYDDjxZjDYc8oMTGs9FGW81dLX7P16D');
    })
  });

  describe('#signData', () => {
    it('should sign the message correctly', () => {
      const message = new Uint8Array(convert.stringToByteArray('hello'));

      const phrase = 'turkey figure exercise invite talent angry raw opinion chicken tackle mean august bind chuckle time';
      const keyPair = crypto.buildKeyPair(phrase, false, true);

      const privateKey = 'wJ4WH8dD88fSkNdFQRjaAhjFUZzZhV5yiDLDwNUnp6bYwRXrvWV8MJhQ9HL9uqMDG1n7XpTGZx7PafqaayQV8Rp';
      const publicKey = 'FkU1XyfrCftc4pQKXCrrDyRLSnifX1SMvmx1CYiiyB3Y';

      const signature = crypto.createSignature(message, privateKey);

      expect(signature).to.eq('2DDGtVHrX66Ae8C4shFho4AqgojCBTcE4phbCRTm3qXCKPZZ7reJBXiiwxweQAkJ3Tsz6Xd3r5qgnbA67gdL5fWE');

      const resWaves = crypto.verifySignature(message, signature, publicKey);
      expect(resWaves).to.be.true;
    });
  })
});
