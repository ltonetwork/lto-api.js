import { expect } from 'chai';
import ed2curve from '../src/libs/ed2curve';
import { LTO } from '../src/LTO';
import crypto from '../src/utils/crypto';
import base58 from '../src/libs/base58';
import * as constants from '../src/constants';

import * as nacl from 'tweetnacl';

let lto;
let seed;

describe('ed2curve', () => {

  beforeEach(() => {
    const lto = new LTO(constants.NETWORK_BYTE_MAINNET);
    //const phrase = 'satisfy sustain shiver skill betray mother appear pupil coconut weasel firm top puzzle monkey seek';
    //const phrase = 'manage manual recall harvest series desert melt police rose hollow moral pledge kitten position add';
    const phrase = 'turkey figure exercise invite talent angry raw opinion chicken tackle mean august bind chuckle time';

    seed = lto.seedFromExistingPhrase(phrase);
  });

  describe('#convertKeyPair', () => {

    it.skip('should generate a correct X25519 keypair from the ED25519 keypair', () => {
      const phrase = 'turkey figure exercise invite talent angry raw opinion chicken tackle mean august bind chuckle time';

      const naclKeyPair = crypto.buildKeyPair(phrase, false, true);
      const curveKeyPair = crypto.buildKeyPair(phrase, true);

      console.log("Nacl private: " + base58.encode(naclKeyPair.privateKey));
      console.log("Nacl public: " + base58.encode(naclKeyPair.publicKey) + "\n");

      console.log("Curve private: " + base58.encode(curveKeyPair.privateKey));
      console.log("Curve public: " + base58.encode(curveKeyPair.publicKey) + "\n");

      const convertKeyPair = {
        secretKey: naclKeyPair.privateKey,
        publicKey: naclKeyPair.publicKey
      };

      const convertedKeyPairBytes = ed2curve.convertKeyPair(convertKeyPair);
      const convertedKeyPair = {
        publicKey: base58.encode(convertedKeyPairBytes.publicKey),
        privateKey: base58.encode(convertedKeyPairBytes.secretKey),
      };

      console.log("Converted Curve private: " + convertedKeyPair.privateKey);
      console.log("Converted public: " + convertedKeyPair.publicKey + "\n");

      console.log(base58.encode(nacl.hash(convertedKeyPairBytes.secretKey)));

      const naclCurveKeyPair = nacl.box.keyPair.fromSecretKey(convertedKeyPairBytes.secretKey);
      console.log('Nacl Curve Public: ', base58.encode(naclCurveKeyPair.publicKey));

      // expect(convertedKeyPair.publicKey).to.eq(base58.encode(curveKeyPair.publicKey));
      expect(convertedKeyPair.privateKey).to.eq(base58.encode(curveKeyPair.privateKey));
    });
  });

  describe('#convertKeyPair', () => {

    it('should generate a correct X25519 keypair from the ED25519 keypair', () => {

      const privateKey = '2CtdjX29c52fKnRDVpqzzJMWYhrixtg4DknH93GzwspcvjynYWXt9JuRS1zYcuh7YNAkfWnUYDXD3ac9zBS2CuPa';
      const publicKey = '3AsSoHHDfXomHBN5XzonEENgwTBBBRqqsnYFGTNhoqUg';


      const convertKeyPair = {
        secretKey: base58.decode(privateKey),
        publicKey: base58.decode(publicKey)
      };

      const convertedKeyPairBytes = ed2curve.convertKeyPair(convertKeyPair);
      const convertedKeyPair = {
        publicKey: base58.encode(convertedKeyPairBytes.publicKey),
        privateKey: base58.encode(convertedKeyPairBytes.secretKey),
      };

      console.log("Converted Curve private: " + convertedKeyPair.privateKey);
      console.log("Converted public: " + convertedKeyPair.publicKey + "\n");

      expect(convertedKeyPair.privateKey).to.eq('BF7TVjd9FT1WYgRQcsrxfj7j1cSX2YjhSVWKzDMtniZy');
      expect(convertedKeyPair.publicKey).to.eq('6qkszTQr4kYq5rVijrUYNvVrewYADeB9fs1LPmf1Kmwe');

      console.log(base58.encode(nacl.hash(convertedKeyPairBytes.secretKey)));

      const naclCurveKeyPair = nacl.box.keyPair.fromSecretKey(convertedKeyPairBytes.secretKey);
      console.log('Nacl Curve Public: ', base58.encode(naclCurveKeyPair.publicKey));

      expect(convertedKeyPair.publicKey).to.eq(base58.encode(naclCurveKeyPair.publicKey));
      expect(convertedKeyPair.privateKey).to.eq(base58.encode(naclCurveKeyPair.privateKey));
    });
  });
});