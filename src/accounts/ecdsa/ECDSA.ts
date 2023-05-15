import { Cypher } from '../Cypher';
import { IKeyPairBytes } from '../../../interfaces';
import { sha256 } from '@noble/hashes/sha256';
import { secp256k1 } from '@noble/curves/secp256k1';
import { secp256r1 } from '@noble/curves/p256';

export class ECDSA extends Cypher {
  private readonly ec: typeof secp256k1;
  public readonly sign: IKeyPairBytes;

  constructor(curve: 'secp256r1' | 'secp256k1', sign: IKeyPairBytes) {
    super(curve);

    this.sign = sign;
    this.ec = curve === 'secp256k1' ? secp256k1 : secp256r1;
  }

  public createSignature(input: Uint8Array): Uint8Array {
    if (!this.sign.privateKey) throw new Error('Unable to sign: no private key');

    const hash = sha256(input);
    const signature = this.ec.sign(hash, this.sign.privateKey);

    return signature.toCompactRawBytes();
  }

  public verifySignature(input: Uint8Array, signature: Uint8Array): boolean {
    const hash = sha256(input);
    const ecSignature = this.ec.Signature.fromCompact(signature);

    return this.ec.verify(ecSignature, hash, this.sign.publicKey);
  }

  public encryptMessage(message: Uint8Array, theirPublicKey: Uint8Array): Uint8Array {
    throw new Error('Encryption not implemented for ECDSA');
  }

  public decryptMessage(cypher: Uint8Array): Uint8Array {
    throw new Error('Encryption not implemented for ECDSA');
  }
}
