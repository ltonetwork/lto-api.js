import { expect } from 'chai';
import { HTTPSignature } from '../src/classes/HTTPSignature';
import { Account } from '../src/classes/Account';

describe('HTTPSignature', () => {

  describe('#signWith', () => {
    it('should create a correct signature header using ed25519', () => {
      const headers = {
        '(request-target)': 'get /test',
        date: (new Date("April 1, 2018 12:00:00")).toISOString()
      };

      const account = new Account();
      account.sign = {
        privateKey: 'wJ4WH8dD88fSkNdFQRjaAhjFUZzZhV5yiDLDwNUnp6bYwRXrvWV8MJhQ9HL9uqMDG1n7XpTGZx7PafqaayQV8Rp',
        publicKey: 'FkU1XyfrCftc4pQKXCrrDyRLSnifX1SMvmx1CYiiyB3Y'
      };

      const httpSign = new HTTPSignature(headers, null);
      httpSign.signWith(account, 'ed25519');
      expect(httpSign.getSignature()).to.eq('keyId="FkU1XyfrCftc4pQKXCrrDyRLSnifX1SMvmx1CYiiyB3Y",algorithm="ed25519",headers="(request-target) date",signature="OM7vaPQAj9Vp7jJHpcGT1qeSlz6DTETTksabLz9UOdn0Y5GR6PPGg80TQ3SulkbgAqipPSgKQlwOUj2bz6wJBA=="');
    });

    it('should create a correct signature header using ed25519-sha256', () => {
      const headers = {
        '(request-target)': 'get /test',
        date: (new Date("April 1, 2018 12:00:00")).toISOString()
      };

      const account = new Account();
      account.sign = {
        privateKey: 'wJ4WH8dD88fSkNdFQRjaAhjFUZzZhV5yiDLDwNUnp6bYwRXrvWV8MJhQ9HL9uqMDG1n7XpTGZx7PafqaayQV8Rp',
        publicKey: 'FkU1XyfrCftc4pQKXCrrDyRLSnifX1SMvmx1CYiiyB3Y'
      };

      const httpSign = new HTTPSignature(headers);
      httpSign.signWith(account);
      expect(httpSign.getSignature()).to.eq('keyId="FkU1XyfrCftc4pQKXCrrDyRLSnifX1SMvmx1CYiiyB3Y",algorithm="ed25519-sha256",headers="(request-target) date",signature="tMAxot4iWb8gB4FQ2zqIMfH2Fd8kA9DwSoW3UZPj9f8QlpLX5VvWf314vFnM8MsDo5kqtGzk7XOOy0TL4zVWAg=="');
    });

    it('should create a correct signature header with post data using ed25519-sha256', () => {
      const body = {
        foo: 'bar'
      };

      const headers = {
        '(request-target)': 'post /test',
        date: (new Date("April 1, 2018 12:00:00")).toISOString()
      };

      const account = new Account();
      account.sign = {
        privateKey: 'wJ4WH8dD88fSkNdFQRjaAhjFUZzZhV5yiDLDwNUnp6bYwRXrvWV8MJhQ9HL9uqMDG1n7XpTGZx7PafqaayQV8Rp',
        publicKey: 'FkU1XyfrCftc4pQKXCrrDyRLSnifX1SMvmx1CYiiyB3Y'
      };

      const httpSign = new HTTPSignature(headers, body);
      httpSign.signWith(account);
      expect(httpSign.getSignature()).to.eq('keyId="FkU1XyfrCftc4pQKXCrrDyRLSnifX1SMvmx1CYiiyB3Y",algorithm="ed25519-sha256",headers="(request-target) date digest",signature="sQmLXVxJP3aMai7ZtpVoEihUGkXgro4tsWrtJaOXxM9MBrlI5+Tt20+ItIlvssZBQZsLslGgztdIQHyoozkHAA=="');
    });
  });

  describe('#verify', () => {

  });
});