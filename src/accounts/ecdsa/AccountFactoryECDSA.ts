import AccountFactory from '../AccountFactory';
import Account from '../Account';
import { IKeyPairBytes } from '../../types';
import { buildAddress } from '../../utils';
import { compressPublicKey, decompressPublicKey } from '../../utils/ecdsa';
import Binary from '../../Binary';
import { ECDSA } from './ECDSA';
import { secp256k1 } from '@noble/curves/secp256k1';
import { secp256r1 } from '@noble/curves/p256';
import { mnemonicToSeedSync, generateMnemonic } from '@scure/bip39';
import { HDKey } from '@scure/bip32';
import { wordlist } from '@scure/bip39/wordlists/english';
import { DEFAULT_DERIVATION_PATH } from '../../constants';

export default class AccountFactoryECDSA extends AccountFactory {
  readonly curve: 'secp256k1' | 'secp256r1';
  private readonly ec: typeof secp256k1;

  constructor(networkId: string, curve: 'secp256k1' | 'secp256r1') {
    super(networkId);
    this.curve = curve;
    this.ec = this.curve === 'secp256k1' ? secp256k1 : secp256r1;
  }

  createFromSeed(seed: string, nonce?: number | Uint8Array | string): Account {
    seed ||= generateMnemonic(wordlist);
    nonce ??= DEFAULT_DERIVATION_PATH;

    if (this.curve === 'secp256r1') throw new Error('secp256r1 is not supported for creating an account from seed');
    if (typeof nonce === 'number') throw new Error(`For ${this.curve}, nonce must be a derivation path`);

    const seedBytes = typeof seed === 'string' ? new Uint8Array(mnemonicToSeedSync(seed)) : seed;
    const hdkey = HDKey.fromMasterSeed(seedBytes);
    const child = hdkey.derive(typeof nonce === 'string' ? nonce : new Binary(nonce).toString());

    if (!child.privateKey) {
      throw new Error('Failed to generate private key from seed');
    }

    return this.createAccountFromPrivateKey(
      child.privateKey,
      seed,
      typeof nonce === 'number' ? nonce : new Binary(nonce),
    );
  }

  createFromPublicKey(publicKey: string | Uint8Array): Account {
    const publicKeyBinary = typeof publicKey === 'string' ? Binary.fromBase58(publicKey) : new Binary(publicKey);

    const compressed: IKeyPairBytes = { publicKey: undefined };
    const uncompressed: IKeyPairBytes = { publicKey: undefined };

    if (publicKeyBinary.length === 33) {
      compressed.publicKey = publicKeyBinary;
      uncompressed.publicKey = new Binary(decompressPublicKey(publicKeyBinary, this.ec.CURVE));
    } else {
      compressed.publicKey = new Binary(compressPublicKey(publicKeyBinary));
      uncompressed.publicKey = publicKeyBinary;
    }

    const address = buildAddress(compressed.publicKey, this.networkId);
    const cypher = new ECDSA(this.curve, uncompressed);
    return new Account(cypher, address, compressed, compressed);
  }

  createFromPrivateKey(privateKey: string | Uint8Array): Account {
    return this.createAccountFromPrivateKey(privateKey);
  }

  private createAccountFromPrivateKey(
    privateKey: string | Uint8Array,
    seed?: string,
    nonce?: number | Uint8Array,
  ): Account {
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
    const address = buildAddress(compressed.publicKey, this.networkId);

    return new Account(cypher, address, compressed, compressed, seed, nonce);
  }

  private createRandomPrivateKey(): Account {
    const privateKey = secp256k1.utils.randomPrivateKey();
    return this.createFromPrivateKey(privateKey);
  }

  private createRandomSeed(): Account {
    const seed = generateMnemonic(wordlist);
    return this.createFromSeed(seed);
  }

  create(): Account {
    return this.curve === 'secp256r1' ? this.createRandomPrivateKey() : this.createRandomSeed();
  }
}
