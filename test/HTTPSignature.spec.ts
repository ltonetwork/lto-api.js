import { expect } from 'chai';
import { HTTPSignature } from '../src/classes/HTTPSignature';
import { Account } from '../src/classes/Account';
import encoder from '../src/utils/encoder';

describe('HTTPSignature', () => {

  describe('#signWith', () => {
    it('should create a correct signature header using ed25519', () => {
      const headers = {
        '(request-target)': 'get /test',
        date: (new Date("April 1, 2018 12:00:00Z")).toISOString()
      };

      const account = new Account();
      account.sign = {
        privateKey: encoder.decode('wJ4WH8dD88fSkNdFQRjaAhjFUZzZhV5yiDLDwNUnp6bYwRXrvWV8MJhQ9HL9uqMDG1n7XpTGZx7PafqaayQV8Rp'),
        publicKey: encoder.decode('FkU1XyfrCftc4pQKXCrrDyRLSnifX1SMvmx1CYiiyB3Y')
      };

      const httpSign = new HTTPSignature(headers, null);
      httpSign.signWith(account, 'ed25519');
      expect(httpSign.getSignature()).to.eq('keyId="2yYhlEGdosg7QZC//hibHiZ1MHk2m7jp/EbUeFdzDis=",algorithm="ed25519",headers="(request-target) date",signature="EATYkJPy+NmqbfBy/rdwUMQvLOb9VilfsP1b4DgIpDjj3lWd5fSMcuQ3YuRUjOv9r8e+iW+3BLdBe3JLvqrYBw=="');
    });

    it('should create a correct signature header using ed25519-sha256', () => {
      const headers = {
        '(request-target)': 'get /test',
        date: (new Date("April 1, 2018 12:00:00Z")).toISOString()
      };

      const account = new Account();
      account.sign = {
        privateKey: encoder.decode('wJ4WH8dD88fSkNdFQRjaAhjFUZzZhV5yiDLDwNUnp6bYwRXrvWV8MJhQ9HL9uqMDG1n7XpTGZx7PafqaayQV8Rp'),
        publicKey: encoder.decode('FkU1XyfrCftc4pQKXCrrDyRLSnifX1SMvmx1CYiiyB3Y')
      };

      const httpSign = new HTTPSignature(headers);
      httpSign.signWith(account);
      expect(httpSign.getSignature()).to.eq('keyId="2yYhlEGdosg7QZC//hibHiZ1MHk2m7jp/EbUeFdzDis=",algorithm="ed25519-sha256",headers="(request-target) date",signature="SUh9qFhP8PYJqoaVMfcYqgSMxBRS74J7LLsNtlzCpagLOY12+pgHB4ujVfyMy1Lr8saPStBmIFhvwh9k9qz8DA=="');
    });

    it('should create a correct signature header with post data using ed25519-sha256', () => {
      const body = {
        foo: 'bar'
      };

      const headers = {
        '(request-target)': 'post /test',
        date: (new Date("April 1, 2018 12:00:00Z")).toISOString()
      };

      const account = new Account();
      account.sign = {
        privateKey: encoder.decode('wJ4WH8dD88fSkNdFQRjaAhjFUZzZhV5yiDLDwNUnp6bYwRXrvWV8MJhQ9HL9uqMDG1n7XpTGZx7PafqaayQV8Rp'),
        publicKey: encoder.decode('FkU1XyfrCftc4pQKXCrrDyRLSnifX1SMvmx1CYiiyB3Y')
      };

      const httpSign = new HTTPSignature(headers, body);
      httpSign.signWith(account);
      expect(httpSign.getSignature()).to.eq('keyId="2yYhlEGdosg7QZC//hibHiZ1MHk2m7jp/EbUeFdzDis=",algorithm="ed25519-sha256",headers="(request-target) date digest",signature="OdToby5/8OV3XUE1YHgj30+kcaNBWQmXJKn5yMl9DW4+Licn10JjPKaOstHtUcEpVrJjjFAb2FuEu0DOwlulBg=="');
    });
  });

  describe('#verify', () => {

  });
});