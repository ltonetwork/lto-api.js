import { Cypher } from '../Cypher';
import { IKeyPairBytes } from '../../types';
import nacl from 'tweetnacl';
import { blake2b } from '@noble/hashes/blake2b';
import { DecryptError } from '../../errors';

export class ED25519 extends Cypher {
  constructor(private sign: IKeyPairBytes, private encrypt?: IKeyPairBytes) {
    super('ed25519');
  }

  private static sealNonce(epk, publicKey) {
    return blake2b.create({ dkLen: nacl.box.nonceLength }).update(epk).update(publicKey).digest();
  }

  private static seal(message, publicKey) {
    const ekp = nacl.box.keyPair();

    const out = new Uint8Array(message.length + nacl.box.overheadLength + nacl.box.publicKeyLength);
    out.set(ekp.publicKey, 0);

    const nonce = this.sealNonce(ekp.publicKey, publicKey);

    const ct = nacl.box(message, nonce, publicKey, ekp.secretKey);
    out.set(ct, nacl.box.publicKeyLength);

    return out;
  }

  private static sealOpen(ciphertext, publicKey, secretKey) {
    const epk = ciphertext.slice(0, nacl.box.publicKeyLength);
    ciphertext = ciphertext.slice(nacl.box.publicKeyLength);

    const nonce = this.sealNonce(epk, publicKey);

    return nacl.box.open(ciphertext, nonce, epk, secretKey);
  }

  encryptMessage(input: Uint8Array): Uint8Array {
    return ED25519.seal(input, this.encrypt.publicKey);
  }

  decryptMessage(input: Uint8Array): Uint8Array {
    if (!this.encrypt.privateKey) throw new Error('Missing private key for decryption');

    const output = ED25519.sealOpen(input, this.encrypt.publicKey, this.encrypt.privateKey);
    if (!output) throw new DecryptError('Unable to decrypt message with given keys');

    return output;
  }

  createSignature(input: Uint8Array): Uint8Array {
    if (!this.sign.privateKey) throw new Error('Missing private key for signing');

    return nacl.sign.detached(input, this.sign.privateKey);
  }

  verifySignature(input: Uint8Array, signature: Uint8Array): boolean {
    return signature.length === 64 && nacl.sign.detached.verify(input, signature, this.sign.publicKey);
  }
}
