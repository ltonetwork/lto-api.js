import { expect } from 'chai';
import { LTO } from '../src/LTO';

let lto;


describe('LTO', () => {

  beforeEach(() => {
    lto = new LTO();
  });

  describe('#createSeed', () => {
    it('should create a seed with ed keys', () => {
      const seed = lto.createSeed();

      expect(seed.phrase.split(' ')).have.length(15);
      expect(seed.keyPair.privateKey).have.length.gte(86);
      expect(seed.keyPair.publicKey).have.length.gte(43);
    });
  });

  describe('#seedFromExistingPhrase', () => {
    it('should create a keypair from a seed', () => {
      const phrase = 'satisfy sustain shiver skill betray mother appear pupil coconut weasel firm top puzzle monkey seek';

      const seed = lto.seedFromExistingPhrase(phrase);
      expect(seed.keyPair.privateKey).to.eq('4hPpf5Lbf5zTszcGLgHWwHdMgMAPAyteFQZt8cYCRqg4KC4byPYXRBzETvxECYGjrewzrUG1eKrfFdZAB3RZRvFw');
      expect(seed.keyPair.publicKey).to.eq('GuCK3Vaemyc3fUH94WUZ8tdQUZuG6YQmQBh93mu8E67F');
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