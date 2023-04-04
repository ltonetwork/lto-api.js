import AccountFactory from '../AccountFactory';
import Account from '../Account';
import { IKeyPairBytes } from '../../../interfaces';
import { decode, Encoding } from '../../utils/encoder';
import { buildRawAddress } from '../../utils/crypto';
import { getCompressPublicKey } from '../../utils/ecdsa';
import Binary from '../../Binary';
import { ECDSA } from './ECDSA';
import { secp256k1 } from '@noble/curves/secp256k1';
import { secp256r1 } from '@noble/curves/p256';
import { mnemonicToSeedSync, generateMnemonic } from '@scure/bip39';
import { HDKey } from '@scure/bip32';
import { wordlist } from '@scure/bip39/wordlists/english';

export default class AccountFactoryECDSA extends AccountFactory {
  public readonly curve: 'secp256k1' | 'secp256r1';
  private readonly ec: typeof secp256k1;

  constructor(chainId: string, curve: 'secp256k1' | 'secp256r1') {
    super(chainId);
    this.curve = curve;
    this.ec = this.curve === 'secp256k1' ? secp256k1 : secp256r1;
  }

  public createFromSeed(seed: string, nonce?: number | Uint8Array | string): Account {
    if (this.curve === 'secp256r1') throw new Error('secp256r1 is not supported for creating an account from seed');
    if (typeof nonce === 'number') throw new Error(`For ${this.curve}, nonce must be a derivation path`);

    const seedBytes = typeof seed === 'string' ? new Uint8Array(mnemonicToSeedSync(seed)) : seed;
    const hdkey = HDKey.fromMasterSeed(seedBytes);
    const child = hdkey.derive(typeof nonce === 'string' ? nonce : new Binary(nonce).toString());

    if (!child.privateKey) {
      throw new Error('Failed to generate private key from seed');
    }

    return this.createFromPrivateKey(child.privateKey);
  }

  public createFromPublicKey(publicKey: string | Uint8Array): Account {
    let extendedPubKey: Uint8Array = null;
    if (publicKey.length > 68 && typeof publicKey == 'string') {
      extendedPubKey =
        publicKey[1] == 'x' ? decode(publicKey.substring(2), Encoding.hex) : decode(publicKey, Encoding.hex);
      publicKey = decode(getCompressPublicKey(publicKey), Encoding.hex);
    }
    const publicKeyBinary = typeof publicKey === 'string' ? Binary.fromBase58(publicKey) : new Binary(publicKey);

    const compressed: IKeyPairBytes = {
      privateKey: null,
      publicKey: publicKeyBinary,
    };
    const uncompressed: IKeyPairBytes = {
      privateKey: null,
      publicKey: new Binary(extendedPubKey),
    };
    const address = buildRawAddress(publicKeyBinary, this.chainId);
    const cypher = new ECDSA(this.curve, uncompressed);
    return new Account(cypher, address, compressed);
  }

  public createFromPrivateKey(privateKey: string | Uint8Array): Account {
    const privateKeyBinary = typeof privateKey === 'string' ? Binary.fromBase58(privateKey) : new Binary(privateKey);

    const compressed = {
      privateKey: privateKeyBinary,
      publicKey: new Binary(this.ec.getPublicKey(privateKeyBinary, true)),
    };

    const uncompressed = {
      privateKey: privateKeyBinary,
      publicKey: new Binary(this.ec.getPublicKey(privateKeyBinary)),
    };

    const cypher = new ECDSA(this.curve, uncompressed);
    const address = buildRawAddress(compressed.publicKey, this.chainId);

    return new Account(cypher, address, compressed);
  }

  private createRandomPrivateKey(): Account {
    const privateKey = secp256k1.utils.randomPrivateKey();
    return this.createFromPrivateKey(privateKey);
  }

  private createRandomSeed(): Account {
    const seed = generateMnemonic(wordlist);
    const derivationPath = "m/44'/118'/0'/0/0";

    return this.createFromSeed(seed, derivationPath);
  }

  public create(): Account {
    return this.curve === 'secp256r1' ? this.createRandomPrivateKey() : this.createRandomSeed();
  }
}
