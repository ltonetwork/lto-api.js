import { Cypher } from '../Cypher';
import { IKeyPairBytes } from '../../types';
import { sha256 } from '@noble/hashes/sha256';
import { sha512 } from '@noble/hashes/sha512';
import { secp256k1 } from '@noble/curves/secp256k1';
import { secp256r1 } from '@noble/curves/p256';
import { hmac } from '@noble/hashes/hmac';
import * as AES from 'crypto-js/aes.js';
import Binary from '../../Binary';
import { compareBytes } from '../../utils/bytes';
import { hexToBytes } from '@noble/hashes/utils';
import { DecryptError } from '../../errors';

/**
 * Encrypts a message using ECIES
 * @see https://cryptobook.nakov.com/asymmetric-key-ciphers/ecies-public-key-encryption
 */
export class ECDSA extends Cypher {
  private readonly ec: typeof secp256k1;
  readonly sign: IKeyPairBytes;

  constructor(curve: 'secp256r1' | 'secp256k1', sign: IKeyPairBytes) {
    super(curve);

    this.sign = sign;
    this.ec = curve === 'secp256k1' ? secp256k1 : secp256r1;
  }

  createSignature(input: Uint8Array): Uint8Array {
    if (!this.sign.privateKey) throw new Error('Unable to sign: no private key');

    const hash = sha256(input);
    const signature = this.ec.sign(hash, this.sign.privateKey);

    return signature.toCompactRawBytes();
  }

  verifySignature(input: Uint8Array, signature: Uint8Array): boolean {
    const hash = sha256(input);
    const ecSignature = this.ec.Signature.fromCompact(signature);

    return this.ec.verify(ecSignature, hash, this.sign.publicKey);
  }

  encryptMessage(input: Uint8Array): Uint8Array {
    const ephemeralPrivateKey = this.ec.utils.randomPrivateKey();
    const ephemeralPublicKey = this.ec.getPublicKey(ephemeralPrivateKey, true);

    const sharedSecret = this.ec.getSharedSecret(ephemeralPrivateKey, this.sign.publicKey);

    const hash = sha512(sharedSecret); // KDF
    const encryptionKey = hash.slice(0, hash.length / 2); // Kenc
    const macKey = hash.slice(hash.length / 2); // Kmac

    const ciphertextBase64 = AES.encrypt(
      new TextDecoder().decode(input),
      new TextDecoder().decode(encryptionKey),
    ).toString();
    const ciphertext = Binary.fromBase64(ciphertextBase64);

    const tag = hmac(sha256, macKey, ciphertext);

    return Binary.concat(ephemeralPublicKey, tag, ciphertext);
  }

  decryptMessage(encryptedMessage: Uint8Array): Uint8Array {
    const ephemeralPublicKey = encryptedMessage.slice(0, 33);
    const tag = encryptedMessage.slice(33, 65);
    const ciphertext = encryptedMessage.slice(65);

    const sharedSecret = this.ec.getSharedSecret(this.sign.privateKey, ephemeralPublicKey);

    const hash = sha512(sharedSecret); // KDF
    const encryptionKey = hash.slice(0, hash.length / 2); // Kenc
    const macKey = hash.slice(hash.length / 2); // Kmac

    if (!compareBytes(tag, hmac(sha256, macKey, ciphertext))) {
      throw new DecryptError('Unable to decrypt message with given keys');
    }

    const decryptedCiphertext = AES.decrypt(Binary.from(ciphertext).base64, new TextDecoder().decode(encryptionKey));

    return hexToBytes(decryptedCiphertext.toString());
  }
}
