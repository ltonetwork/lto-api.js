import { expect } from 'chai';
//import { LTO } from '../dist/lto-api.min';
import { LTO } from '../src/LTO';
import base58 from "../src/libs/base58";

let lto;

describe('LTO', () => {

  beforeEach(() => {
    lto = new LTO('W');
  });

  describe('#createAccount', () => {
    it('should create an account with a random seed', () => {
      const account = lto.createAccount();

      expect(base58.decode(account.sign.privateKey)).to.have.length(64);
      expect(base58.decode(account.sign.publicKey)).to.have.length(32);
    });
  });

  describe('#accountFromExistingPhrase', () => {
    it('should create an account with from an existing seed', () => {
      const phrase = 'manage manual recall harvest series desert melt police rose hollow moral pledge kitten position add';
      const account = lto.createAccountFromExistingPhrase(phrase);

      expect(account.encrypt.publicKey).to.eq('HBqhfdFASRQ5eBBpu2y6c6KKi1az6bMx8v1JxX4iW1Q8');
      expect(account.encrypt.privateKey).to.eq('3kMEhU5z3v8bmer1ERFUUhW58Dtuhyo9hE5vrhjqAWYT');
      expect(account.sign.privateKey).to.eq('wJ4WH8dD88fSkNdFQRjaAhjFUZzZhV5yiDLDwNUnp6bYwRXrvWV8MJhQ9HL9uqMDG1n7XpTGZx7PafqaayQV8Rp');
      expect(account.sign.publicKey).to.eq('FkU1XyfrCftc4pQKXCrrDyRLSnifX1SMvmx1CYiiyB3Y');
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
});