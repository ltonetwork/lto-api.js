import AccountFactory from '../AccountFactory';
import Account from '../Account';
import { IKeyPairBytes } from '../../types';
import nacl from 'tweetnacl';
import { base58 } from '@scure/base';
import { ED25519 } from './ED25519';
import ed2curve from 'ed2curve';
import Binary from '../../Binary';
import { concatBytes } from '@noble/hashes/utils';
import { generateNewSeed } from '../../utils/mnemonic';
import { buildAddress, secureHash } from '../../utils/crypto';
import { sha256 } from '@noble/hashes/sha256';

export default class AccountFactoryED25519 extends AccountFactory {
  keyType = 'ed25519';
  sign: IKeyPairBytes;
  encrypt: IKeyPairBytes;

  constructor(networkId: string) {
    super(networkId);
  }

  createFromSeed(seed: string, nonce: number | Uint8Array = 0): Account {
    const keys = AccountFactoryED25519.buildSignKeyPairFromSeed(seed, nonce);
    const sign: IKeyPairBytes = {
      privateKey: keys.privateKey,
      publicKey: keys.publicKey,
    };
    const encrypt: IKeyPairBytes = {
      privateKey: new Binary(ed2curve.convertSecretKey(keys.privateKey)),
      publicKey: new Binary(ed2curve.convertPublicKey(keys.publicKey)),
    };

    const cypher = new ED25519(sign, encrypt);
    const address = buildAddress(sign.publicKey, this.networkId);

    return new Account(cypher, address, sign, encrypt, seed, nonce);
  }

  createFromPrivateKey(privateKey: string | Uint8Array): Account {
    const keys = AccountFactoryED25519.buildSignKeyPairFromPrivateKey(privateKey);
    const sign: IKeyPairBytes = {
      privateKey: keys.privateKey,
      publicKey: keys.publicKey,
    };
    const encrypt: IKeyPairBytes = {
      privateKey: new Binary(ed2curve.convertSecretKey(keys.privateKey)),
      publicKey: new Binary(ed2curve.convertPublicKey(keys.publicKey)),
    };

    const cypher = new ED25519(sign, encrypt);
    const address = buildAddress(sign.publicKey, this.networkId);

    return new Account(cypher, address, sign, encrypt);
  }

  createFromPublicKey(publicKey: string | Uint8Array): Account {
    const publicKeyBinary = typeof publicKey === 'string' ? Binary.fromBase58(publicKey) : new Binary(publicKey);

    const sign: IKeyPairBytes = {
      publicKey: publicKeyBinary,
    };
    const encrypt: IKeyPairBytes = {
      publicKey: new Binary(ed2curve.convertPublicKey(publicKeyBinary)),
    };

    const cypher = new ED25519(sign, encrypt);
    const address = buildAddress(sign.publicKey, this.networkId);

    return new Account(cypher, address, sign, encrypt);
  }

  create(numberOfWords = 15): Account {
    return this.createFromSeed(generateNewSeed(numberOfWords));
  }

  private static buildSignKeyPairFromSeed(seed: string, nonce: number | Uint8Array): IKeyPairBytes {
    if (!seed || typeof seed !== 'string') throw new Error('Missing or invalid seed phrase');

    const seedBytes = new Binary(seed);
    const seedHash = AccountFactoryED25519.buildSeedHash(seedBytes, AccountFactory.nonce(nonce));
    const keys = nacl.sign.keyPair.fromSeed(seedHash);

    return {
      privateKey: new Binary(keys.secretKey),
      publicKey: new Binary(keys.publicKey),
    };
  }

  private static buildSeedHash(seedBytes: Uint8Array, nonceBytes: Uint8Array = new Uint8Array()): Uint8Array {
    const seedBytesWithNonce = concatBytes(nonceBytes, seedBytes);
    const seedHash = secureHash(seedBytesWithNonce);

    return sha256(seedHash);
  }

  private static buildSignKeyPairFromPrivateKey(privateKey: string | Uint8Array): IKeyPairBytes {
    const privateKeyBytes = typeof privateKey === 'string' ? base58.decode(privateKey) : privateKey;
    const keys = nacl.sign.keyPair.fromSecretKey(privateKeyBytes);

    return {
      privateKey: new Binary(keys.secretKey),
      publicKey: new Binary(keys.publicKey),
    };
  }
}
