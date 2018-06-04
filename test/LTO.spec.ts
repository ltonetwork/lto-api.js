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

      expect(account.sign.privateKey).to.have.length(64);
      expect(account.sign.publicKey).to.have.length(32);
    });
  });

  describe('#accountFromExistingPhrase', () => {
    it('should create an account with from an existing seed', () => {
      const phrase = 'manage manual recall harvest series desert melt police rose hollow moral pledge kitten position add';
      const account = lto.createAccountFromExistingPhrase(phrase);

      expect(account.getPublicEncryptKey()).to.eq('Cuotpoq3gtBrqwVdrgeek7zTTVargATph5pAqPBLdo7A');
      expect(account.getPrivateEncryptKey()).to.eq('98oeCpf79LJV6UgymYZL17gRw27UYF213mC4ifbBauTk');
      expect(account.getPrivateSignKey()).to.eq('wJ4WH8dD88fSkNdFQRjaAhjFUZzZhV5yiDLDwNUnp6bYwRXrvWV8MJhQ9HL9uqMDG1n7XpTGZx7PafqaayQV8Rp');
      expect(account.getPublicSignKey()).to.eq('FkU1XyfrCftc4pQKXCrrDyRLSnifX1SMvmx1CYiiyB3Y');
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