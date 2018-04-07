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
      expect(seed.signKeys.privateKey).to.eq('wJ4WH8dD88fSkNdFQRjaAhjFUZzZhV5yiDLDwNUnp6bYwRXrvWV8MJhQ9HL9uqMDG1n7XpTGZx7PafqaayQV8Rp');
      expect(seed.signKeys.publicKey).to.eq('FkU1XyfrCftc4pQKXCrrDyRLSnifX1SMvmx1CYiiyB3Y');
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
      expect(signature).to.be.eq('5e2XrGPGdp1saspporpfzMVSnB1r7tzWVwYjfpyUk47YvJWBFx4Qx32KLoorEBTbh5MiQSbq9ytmjVKbdbJPFafY');
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

      const signature = '5e2XrGPGdp1saspporpfzMVSnB1r7tzWVwYjfpyUk47YvJWBFx4Qx32KLoorEBTbh5MiQSbq9ytmjVKbdbJPFafY';

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

  describe('#createSignature', () => {
    it('should create a correct signature', () => {
      const phrase = 'turkey figure exercise invite talent angry raw opinion chicken tackle mean august bind chuckle time';
      const seed = lto.seedFromExistingPhrase(phrase);

      const headers = {
        '(request-target)': 'post /api/events/event-chains',
        'x-date': '1522854960166',
        digest: '47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU=',
        'content-length': 8192
      };

      const signature = lto.signRequest(headers, seed.signKeys.publicKey, seed.signKeys.privateKey, false, false);
      expect(signature).to.be.eq('keyId="Gp8A9bkGdkKmdzYDDjxZjDYc8oMTGs9FGW81dLX7P16D",algorithm="ed25519",headers="(request-target) x-date digest content-length",signature="BdvMUR8Mqj+lmOGJ9h0vkhB9JbOocmcFrH6km/9qcARYG579o5EJ48l17vd25oTrIgWdvuDakm3d3kqwK1gDAw=="');

      headers.signature = signature;

      expect(lto.verifyRequest(headers, seed.signKeys.publicKey, 'base64')).to.be.true;
    });
  });

  describe('#signRequest', () => {
    it('should create a correct signature on get requests', () => {
      const phrase = 'satisfy sustain shiver skill betray mother appear pupil coconut weasel firm top puzzle monkey seek';

      const headers = {
        '(request-target)': 'get /api/processes',
        date: (new Date("April 1, 2018 12:00:00")).toISOString()
      };

      const seed = lto.seedFromExistingPhrase(phrase);
      const signature = lto.signRequest(headers, seed.signKeys.publicKey, seed.signKeys.privateKey);
      expect(signature).to.eq('keyId="EUkmkWG6TRbsZdQ9UjGySTzkMJq9eaKAjwJpW3Wv6DDH",algorithm="ed25519-sha256",headers="(request-target) date",signature="DeQkmr2Si+9c0c+MUZN1ulVQJKzCIoHT71oJjzcdQ4NCbm1Trc3uyQvX+wfTjnozpHWKX9Q+4tvkjN1+7rBJDA=="');
    });

    it('should create a correct signature on get requests without sha256', () => {
      const phrase = 'satisfy sustain shiver skill betray mother appear pupil coconut weasel firm top puzzle monkey seek';

      const headers = {
        '(request-target)': 'get /api/processes',
        date: (new Date("April 1, 2018 12:00:00")).toISOString()
      };

      const seed = lto.seedFromExistingPhrase(phrase);
      const signature = lto.signRequest(headers, seed.signKeys.publicKey, seed.signKeys.privateKey, false);
      expect(signature).to.eq('keyId="EUkmkWG6TRbsZdQ9UjGySTzkMJq9eaKAjwJpW3Wv6DDH",algorithm="ed25519",headers="(request-target) date",signature="z+GyFbpHZQUUQ/gJSlz4gx/RfeFtyqe/AeYE5fov4IS3KfP36w4+LzLlcExgocr3jspkovGPozREx8n6M2VhDg=="');
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
      const signature = lto.signRequest(headers, seed.signKeys.publicKey, seed.signKeys.privateKey);
      expect(signature).to.eq('keyId="EUkmkWG6TRbsZdQ9UjGySTzkMJq9eaKAjwJpW3Wv6DDH",algorithm="ed25519-sha256",headers="(request-target) date digest",signature="xwTX2Z+ZJYBfehq9PlEGmv6tYIVKqfSiqg+3J2dyYlJ+0Gw9OIxQqA0NN2dxLqMyHa9bShnwhAQo98Ap6B/mBQ=="');
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
      const signature = lto.signRequest(headers, seed.signKeys.publicKey, seed.signKeys.privateKey);
      expect(signature).to.eq('keyId="EUkmkWG6TRbsZdQ9UjGySTzkMJq9eaKAjwJpW3Wv6DDH",algorithm="ed25519-sha256",headers="(request-target) date digest content-length",signature="AeID+MxHVUSHOvPxD6744jbFtGNMxmyF3MnPBHsRlwsKkiUXd2Gums1Oa7f0CLq+zb9Ujmq8bMKNICXAHHK+Aw=="');
    });

    it('should create a correct signature on live test', () => {
      const publicKey = 'FkU1XyfrCftc4pQKXCrrDyRLSnifX1SMvmx1CYiiyB3Y';
      const privateKey = 'wJ4WH8dD88fSkNdFQRjaAhjFUZzZhV5yiDLDwNUnp6bYwRXrvWV8MJhQ9HL9uqMDG1n7XpTGZx7PafqaayQV8Rp';

      const body = {
        Hello: 'World'
      };

      const digest = lto.createDigest(JSON.stringify(body));
      const contentLength = JSON.stringify(body).length;

      const headers = {
        '(request-target)': 'post /api/events/event-chains',
        'x-date': '1522854960166',
        digest: '47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU=',
        'content-length': '8192'
      };

      const signature = lto.signRequest(headers, publicKey, privateKey);
      expect(signature).to.eq('keyId="FkU1XyfrCftc4pQKXCrrDyRLSnifX1SMvmx1CYiiyB3Y",algorithm="ed25519-sha256",headers="(request-target) x-date digest content-length",signature="nE3vSPqKAjDYjwzfdqJZ7cW38NiKZsCiKiNM+8N58drVV2d+d87PiHBXcFUM8nWPRSR801fWUuJ0FL+4eFGlAQ=="');
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
  });


});