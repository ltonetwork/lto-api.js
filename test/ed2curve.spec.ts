import { expect } from 'chai';
import ed2curve from '../src/libs/ed2curve';
import { LTO } from '../src/LTO';
import base58 from "../src/libs/base58";

let lto;
let seed;

describe('ed2curve', () => {

  beforeEach(() => {
    const lto = new LTO();
    //const phrase = 'satisfy sustain shiver skill betray mother appear pupil coconut weasel firm top puzzle monkey seek';
    const phrase = 'manage manual recall harvest series desert melt police rose hollow moral pledge kitten position add';

    seed = lto.seedFromExistingPhrase(phrase);
  });

  describe('#convertKeyPair', () => {
    it('should generate a correct X25519 keypair from the ED25519 keypair', () => {
      const publicKeyBytes = base58.decode(seed.signKeys.publicKey);
      const privateKeyBytes = base58.decode(seed.signKeys.privateKey);

      const convertKeyPair = {
        publicKey: publicKeyBytes,
        secretKey: privateKeyBytes
      };

      const convertedKeyPairBytes = ed2curve.convertKeyPair(convertKeyPair);
      const convertedKeyPair = {
        publicKey: base58.encode(convertedKeyPairBytes.publicKey),
        privateKey: base58.encode(convertedKeyPairBytes.secretKey),
      };

      expect(convertedKeyPair.publicKey).to.eq(seed.encryptKeys.publicKey);
      expect(convertedKeyPair.privateKey).to.eq(seed.encryptKeys.privateKey);
    });
  });
});