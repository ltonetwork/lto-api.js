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
    it('should create a correct signature on get requets', () => {
      const phrase = 'satisfy sustain shiver skill betray mother appear pupil coconut weasel firm top puzzle monkey seek';

      const headers = {
        '(request-target)': 'get /api/processes',
        date: (new Date("April 1, 2018 12:00:00")).toISOString()
      };

      const seed = lto.seedFromExistingPhrase(phrase);
      const signature = lto.signRequest(headers, seed.signKeys.publicKey, seed.signKeys.privateKey, false);
      expect(signature).to.eq('keyId="EUkmkWG6TRbsZdQ9UjGySTzkMJq9eaKAjwJpW3Wv6DDH",algorithm="ed25519-sha256",headers="(request-target) date",signature="DeQkmr2Si+9c0c+MUZN1ulVQJKzCIoHT71oJjzcdQ4NCbm1Trc3uyQvX+wfTjnozpHWKX9Q+4tvkjN1+7rBJDA=="');
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
      const signature = lto.signRequest(headers, seed.signKeys.publicKey, seed.signKeys.privateKey, false);
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

      const signature = lto.signRequest(headers, publicKey, privateKey, false);
      expect(signature).to.eq('keyId="FkU1XyfrCftc4pQKXCrrDyRLSnifX1SMvmx1CYiiyB3Y",algorithm="ed25519-sha256",headers="(request-target) x-date digest content-length",signature="nE3vSPqKAjDYjwzfdqJZ7cW38NiKZsCiKiNM+8N58drVV2d+d87PiHBXcFUM8nWPRSR801fWUuJ0FL+4eFGlAQ=="');
    });
  });

  describe('#verifyRequest', () => {
    it('should verify a request', () => {

      const body = {
        "id": "LHtiaxfN26KYWN9VaVfesijcjeiAs1n5Hg7te3NKH6Uvo",
        "events": [
          {
            "timestamp": "2018-04-04T11:59:31.762Z",
            "body": "NWGTonBqAwU5LBMVX6N68BhRDDSXD8cZtYXMyckL9HAiNbVBsrGurQtLZ7Z3kfyr9GhSaWtfDSjn8zRjwJECfA4Bs9EF2nbbSDq2ApMst5KEL6rnxxd5UDxpSiQ5BzA6WWJ9Rw4tZWKDbEgKRUExe6VLifYBiAozaV7nkxQsMbKMiWQiHrizQrZaYi5wqfSr86vk4DZFoq7ja1BM38iMQitioDRP2hXb1BAWooy1iRM2foiFsarRm2V2XFBU4k4kd1d3cPuNRYFT9Cje86aKZT87RpS2FoHZpjBd3HTmm8rmBJhddCjZLf9JQ19JhfuDCmbYFWwcTU3FUrAF4NBSwLD7u7gxXfRe7xc7nYwt4S9iFQrqXuj4X6DKdEJvEkjtj6UaZbu3gV2q7xXtikd4fKNJN6bxHChJr97PWzXu2LvLYUNooJZB2KhxPKyV82Xv",
            "previous": "ERJQ8tD63XQJsyRyq3o9hSnDh71U5iXmWEvUX9qHDy9W",
            "signkey": "9MTLMUaePzjm2GL3J6Zxv9ersEa6bng7b8rVAeAft8wu",
            "signature": "5ySv1zUcnuAseQEqey2nM7FVGMvjNs52ExsXYstYhgH2PJ9MMi1hX84twuHhcw13148oQLKZcfiPvxbVHgoj43Ew",
            "hash": "FbjaJAY9fzgCYvkfX58Erqzxqtc9UNAdbGLfjfPsQtrs"
          },
          {
            "timestamp": "2018-04-04T11:59:31.931Z",
            "body": "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",
            "previous": "FbjaJAY9fzgCYvkfX58Erqzxqtc9UNAdbGLfjfPsQtrs",
            "signkey": "9MTLMUaePzjm2GL3J6Zxv9ersEa6bng7b8rVAeAft8wu",
            "signature": "P9gXi4z9SmPP4Dm6bYrvecGvNtxQnvRQvkZWXoNCaGEQq6Rw9baLnBfge69jz2isQDS38BWJLXU8Qj1wmcrr1wy",
            "hash": "5XRW2c6mfGoH8M8DcPgza3WsWxLtcfp85JcPWwaWVtXi"
          },
          {
            "timestamp": "2018-04-04T11:59:31.992Z",
            "body": "PnSxgbkXoeGGxiJsg9Z7R9xReCSb6GhmBNMJh6ocFhWnJUABFnnc3iq7maAqKNtGBACMPwTuFtMi7tsHWzdF3TpdpFALkX5y7cCBkmPbDwjT5JmZ3aLFR1UqXmmvii3sYb3YqoSyQCSebEw2kGPg1FT6UYK4Qdmmbiifxu1HuKdYcVTeadWTmcMpzmaUJrkoZzzuFFxK9zHzs8tjR88JSVgVqQk2Kt7VSMCSDdAAUqW8ZCBM5RvDPFwn1tE73mE8ux3XDCEpttaCtWr5tT7Udss8EnSAJsVHMvmb1GEyhAjuqPJzDf7S5nPYYGqrcjfrBQgmEcKNggqZkqpJy8p5R8FUoWUSnGyMfeJZjAE8Y8MP4MWnejLwMaVsuhtfQUqVZ68sEjRZSy84QksaM6syWR7ytL6QJTy8CYe5akF54jS76iZVeK5nouCQQzYtDzAUN2d1VUu5r7XaVF8mqZULQ1oNofFD7443AgJx1NHHohd4e5At9wnW7vPKCA4DjiBF5nQgn3E",
            "previous": "5XRW2c6mfGoH8M8DcPgza3WsWxLtcfp85JcPWwaWVtXi",
            "signkey": "9MTLMUaePzjm2GL3J6Zxv9ersEa6bng7b8rVAeAft8wu",
            "signature": "2AiDYuLsAqDW7FKSoJ4S2QsFyeVbZ3u3PutRA8ssGMG1ThR1jp8FoWF642TuuEgiPY7kXNSPp7E1gZdJsRPfkyB6",
            "hash": "Bnukv1hkXPg1DuR5EgsjCrvMPh3n7heSqLynNURdq8tg"
          }
        ]
      };

      const headers = {
        '(request-target)': 'post /api/events/event-chains',
        'x-date': '1522843172048',
        digest: '47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU=',
        'content-length': 8192,
        signature: 'keyId="9MTLMUaePzjm2GL3J6Zxv9ersEa6bng7b8rVAeAft8wu",algorithm="ed25519",headers="(request-target) x-date digest content-length",signature="/iy+odu8JxOm9YIWYmFQP8KjhBpWYpQLOeV1psC+ISk3gePdLKGEcC11SZwhYaJw381XFEp13Pg29rwc8reUAg=="'
      };

      expect(lto.verifyRequest(headers, '9MTLMUaePzjm2GL3J6Zxv9ersEa6bng7b8rVAeAft8wu', 'base64')).to.be.true;

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