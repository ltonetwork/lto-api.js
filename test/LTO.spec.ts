import { expect } from 'chai';
//import { LTO } from '../dist/lto-api.min';
import { LTO } from '../src/LTO';
import base58 from "../src/libs/base58";
import * as sinon from 'sinon';

let lto;

describe('LTO', () => {

  beforeEach(() => {
    lto = new LTO('W');
  });

  describe('#createSeed', () => {
    it('should create a seed with ed keys', () => {
      const seed = lto.createSeed();

      expect(seed.phrase.split(' ')).have.length(15);
      expect(seed.signKeys.privateKey).have.length.gte(86);
      expect(seed.signKeys.publicKey).have.length.gte(43);
    });
  });

  describe('#seedFromExistingPhrase', () => {
    it('should create a keypair from a seed', () => {
      //const phrase = 'satisfy sustain shiver skill betray mother appear pupil coconut weasel firm top puzzle monkey seek';
      const phrase = 'manage manual recall harvest series desert melt police rose hollow moral pledge kitten position add';

      const seed = lto.seedFromExistingPhrase(phrase);
      expect(seed.address).to.eq('3PPbMwqLtwBGcJrTA5whqJfY95GqnNnFMDX');
      expect(seed.encryptKeys.publicKey).to.eq('HBqhfdFASRQ5eBBpu2y6c6KKi1az6bMx8v1JxX4iW1Q8');
      expect(seed.encryptKeys.privateKey).to.eq('3kMEhU5z3v8bmer1ERFUUhW58Dtuhyo9hE5vrhjqAWYT');
      expect(seed.signKeys.privateKey).to.eq('pLX2GgWzkjiiPp2SsowyyHZKrF4thkq1oDLD7tqBpYDwfMvRsPANMutwRvTVZHrw8VzsKjiN8EfdGA9M84smoEz');
      expect(seed.signKeys.publicKey).to.eq('BvEdG3ATxtmkbCVj9k2yvh3s6ooktBoSmyp8xwDqCQHp');
    });
  });

  describe('#encryptSeedPhrase / #decryptSeedPhrase', () => {
    it('should encrypt and decrypt phrase', () => {
      const phrase = 'satisfy sustain shiver skill betray mother appear pupil coconut weasel firm top puzzle monkey seek';
      const password = 'secretpassword';

      const encryptedPhrase = lto.encryptSeedPhrase(phrase, password);

      const decryptedPhrase = lto.decryptSeedPhrase(encryptedPhrase, password);
      expect(decryptedPhrase).to.eq(phrase);
    });
  });

  describe('#signEvent', () => {

    it('should sign an object and verify it', () => {
      const phrase = 'satisfy sustain shiver skill betray mother appear pupil coconut weasel firm top puzzle monkey seek';
      const seed = lto.seedFromExistingPhrase(phrase);

      const event = {
        body: 'somebody',
        timestamp: new Date(1520000000).toISOString(),
        previous: 'fake_hash',
        signkey: seed.signKeys.publicKey
      };

      const signature = lto.signEvent(event, seed.signKeys.privateKey);
      expect(signature).to.be.eq('4uw1LLMb9KLHGuzzKVpPUAHKLbVNM9VsXS9n971CusHPHZnxT9xzKEPPaFz2QpJRXkHipWrCtrfgAkz43Qmzx938');
    });
  });

  describe('#verifyEvent', () => {
    it('should return true if signature matches the object', () => {
      const phrase = 'satisfy sustain shiver skill betray mother appear pupil coconut weasel firm top puzzle monkey seek';
      const seed = lto.seedFromExistingPhrase(phrase);
      const event  = {
        body: 'somebody',
        timestamp: new Date(1520000000).toISOString(),
        previous: 'fake_hash',
        signkey: seed.signKeys.publicKey
      };

      const signature = '4uw1LLMb9KLHGuzzKVpPUAHKLbVNM9VsXS9n971CusHPHZnxT9xzKEPPaFz2QpJRXkHipWrCtrfgAkz43Qmzx938';

      const res = lto.verifyEvent(event, signature, seed.signKeys.publicKey);
      expect(res).to.be.true;
    });

    it('should return true if signature matches the object with random bytes', () => {
      const phrase = 'satisfy sustain shiver skill betray mother appear pupil coconut weasel firm top puzzle monkey seek';
      const seed = lto.seedFromExistingPhrase(phrase);
      const event  = {
        body: 'somebody',
        timestamp: new Date(1520000000).toISOString(),
        previous: 'fake_hash',
        signkey: seed.signKeys.publicKey
      };

      const signature = lto.signEvent(event, seed.signKeys.privateKey, true);

      const res = lto.verifyEvent(event, signature, seed.signKeys.publicKey);
      expect(res).to.be.true;
    });

    it('should return false if signature doesn\'t match the object', () => {
      const phrase = 'satisfy sustain shiver skill betray mother appear pupil coconut weasel firm top puzzle monkey seek';
      const seed = lto.seedFromExistingPhrase(phrase);
      const event = {
        body: 'somebody',
        timestamp: new Date(1520000000).toISOString(),
        previous: 'fake_hash',
        signkey: seed.signKeys.publicKey
      };

      const signature = 'RVxWjySPSgrvLJrAkaszbQHh5wmy89Uf9HKNeNCumQaiANiBtmDhZuj9WjSQPzJDVhGyyvvM1myCqdeuxQKQWcr';

      const res = lto.verifyEvent(event, signature, seed.signKeys.publicKey);
      expect(res).to.be.false;
    });

    it('should return false if signature doesn\'t match the object', () => {
      const phrase = 'satisfy sustain shiver skill betray mother appear pupil coconut weasel firm top puzzle monkey seek';
      const seed = lto.seedFromExistingPhrase(phrase);
      const event = {
        body: 'somebody',
        timestamp: new Date(1520000000).toISOString(),
        previous: 'fake_hash',
        signkey: seed.signKeys.publicKey
      };

      const signature = lto.signEvent(event, seed.signKeys.privateKey, true);

      const otherEvent = {
        body: 'otherbody',
        timestamp: new Date(1520000000).toISOString(),
        previous: 'fake_hash',
        signkey: seed.signKeys.publicKey
      };

      const res = lto.verifyEvent(otherEvent, signature, seed.signKeys.publicKey);
      expect(res).to.be.false;
    });
  });

  describe('#createEventId', () => {
    it('should create a valid transaction id', () => {

      const publicKey = 'GuCK3Vaemyc3fUH94WUZ8tdQUZuG6YQmQBh93mu8E67F';

      const eventChainId = lto.createEventId(publicKey);

      expect(lto.verifyEventId(eventChainId, publicKey)).to.be.true;
    });

    it('should create a valid transaction id', () => {

      const publicKey = '8MeRTc26xZqPmQ3Q29RJBwtgtXDPwR7P9QNArymjPLVQ';
      sinon.stub(lto, 'getNonce').returns(Uint8Array.from([0, 0, 0, 0, 0, 0, 0, 0]));

      const eventChainId = lto.createEventId(publicKey);
      expect(eventChainId).to.eq('L1hGimV7Pp2CFNUnTCitqWDbk9Zng3r3uc66dAG6hLwEx');

      expect(lto.verifyEventId(eventChainId, publicKey)).to.be.true;
    });
  });

  describe('#signRequest', () => {
    it('should verify a valid signature correct', () => {
      const headers = {
        '(request-target)': 'get /api/processes',
        date: (new Date("April 1, 2018 12:00:00")).toISOString(),
        signature: 'keyId="GuCK3Vaemyc3fUH94WUZ8tdQUZuG6YQmQBh93mu8E67F",algorithm="ed25519-sha256",headers="(request-target) date",signature="5c/H1bpfsr0OQ2VQDgUwUEDKX4KZe+Gjo2Z4xhy+3ZXs6qBadaUclnRKsvvc0tfZuXVJ3rY8BiuKnEL8Ae78Cw=="'
      };

      expect(lto.verifyRequest(headers, 'GuCK3Vaemyc3fUH94WUZ8tdQUZuG6YQmQBh93mu8E67F', 'base64')).to.be.true;
    });
  });

  describe('#signRequest', () => {
    it('should create a correct signature on get requets', () => {
      const phrase = 'satisfy sustain shiver skill betray mother appear pupil coconut weasel firm top puzzle monkey seek';

      const headers = {
        '(request-target)': 'get /api/processes',
        date: (new Date("April 1, 2018 12:00:00")).toISOString()
      };

      const seed = lto.seedFromExistingPhrase(phrase);
      const signature = lto.signRequest(headers, seed.signKeys.publicKey, seed.signKeys.privateKey, false);
      expect(signature).to.eq('keyId="GuCK3Vaemyc3fUH94WUZ8tdQUZuG6YQmQBh93mu8E67F",algorithm="ed25519-sha256",headers="(request-target) date",signature="5c/H1bpfsr0OQ2VQDgUwUEDKX4KZe+Gjo2Z4xhy+3ZXs6qBadaUclnRKsvvc0tfZuXVJ3rY8BiuKnEL8Ae78Cw=="');
    });

    it('should create a correct signature on post with digest', () => {
      const phrase = 'satisfy sustain shiver skill betray mother appear pupil coconut weasel firm top puzzle monkey seek';

      const body = {
        Hello: 'World'
      };

      const digest = lto.createDigest(JSON.stringify(body));

      const headers = {
        '(request-target)': 'post /api/processes',
        date: (new Date("April 1, 2018 12:00:00")).toISOString(),
        digest
      };

      const seed = lto.seedFromExistingPhrase(phrase);
      const signature = lto.signRequest(headers, seed.signKeys.publicKey, seed.signKeys.privateKey, false);
      expect(signature).to.eq('keyId="GuCK3Vaemyc3fUH94WUZ8tdQUZuG6YQmQBh93mu8E67F",algorithm="ed25519-sha256",headers="(request-target) date digest",signature="Jf/0XlQogySZdIJhm8H9yyWaazxPXWBCafxxp9H+q/unKN2zr/VN+jhb0Qfvb3uUCZ2yBiiutGhzXB/3gYZ0Bw=="');
    });

    it('should create a correct signature on post with digest and content-length', () => {
      const phrase = 'satisfy sustain shiver skill betray mother appear pupil coconut weasel firm top puzzle monkey seek';

      const body = {
        Hello: 'World'
      };

      const digest = lto.createDigest(JSON.stringify(body));
      const contentLength = JSON.stringify(body).length;

      const headers = {
        '(request-target)': 'post /api/processes',
        date: (new Date("April 1, 2018 12:00:00")).toISOString(),
        digest,
        'content-length': contentLength
      };

      const seed = lto.seedFromExistingPhrase(phrase);
      const signature = lto.signRequest(headers, seed.signKeys.publicKey, seed.signKeys.privateKey, false);
      expect(signature).to.eq('keyId="GuCK3Vaemyc3fUH94WUZ8tdQUZuG6YQmQBh93mu8E67F",algorithm="ed25519-sha256",headers="(request-target) date digest content-length",signature="zulLfWUJzpLJUoki2k/XKsOTbY+sWvjWr0Oe2JU3cIAG1GCufws+zHxvWjBY/AspxN9pxbCOOJT7LljV0xPYAg=="');
    });
  });

  describe('#hashEvent', () => {
    it('should generate a correct hash', () => {
      const event = {
        body: 'somebody',
        timestamp: new Date(1520000000).toISOString(),
        previous: 'fake_hash',
        signkey: 'GuCK3Vaemyc3fUH94WUZ8tdQUZuG6YQmQBh93mu8E67F'
      };

      expect(lto.hashEvent(event)).to.eq('FDTDMvFEQA7adTxF82N74dAJ3JKhJq8YdCHN4ip8p6jb');
    });
  });

  describe('#hashEventId', () => {
    it('should generate a correct hash', () => {
      const eventId = 'FDTDMvFEQA7adTxF82N74dAJ3JKhJq8YdCHN4ip8p6jb';

      expect(lto.hashEventId(eventId)).to.eq('25vni1Pwvoe8g1q881GaRvrAGwALDjGqqfh81SuVAhEk');
    });

    it('should generate a correct hash', () => {
      const eventId = 'L1hGimV7Pp2CFNUnTCitqWDbk9Zng3r3uc66dAG6hLwEx';

      expect(lto.hashEventId(eventId)).to.eq('9HM1ykH7AxLgdCqBBeUhvoTH4jkq3zsZe4JGTrjXVENg');
    });
  })
});