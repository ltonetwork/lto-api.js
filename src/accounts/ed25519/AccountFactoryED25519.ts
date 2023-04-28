import AccountFactory from '../AccountFactory';
import Account from '../Account';
import { IKeyPairBytes } from '../../../interfaces';
import * as nacl from 'tweetnacl';
import { base58 } from '@scure/base';
import { ED25519 } from './ED25519';
import ed2curve from '../../libs/ed2curve';
import Binary from '../../Binary';
import { concatBytes } from '@noble/hashes/utils';
import { generateNewSeed } from '../../utils/mnemonic';
import { buildRawAddress, secureHash } from '../../utils/crypto';
import { sha256 } from '@noble/hashes/sha256';

export default class AccountFactoryED25519 extends AccountFactory {
  keyType = 'ed25519';
  sign: IKeyPairBytes;
  encrypt: IKeyPairBytes;

  constructor(chainId: string) {
    super(chainId);
  }

  public createFromSeed(seed: string, nonce: number | Uint8Array = 0): Account {
    const keys = AccountFactoryED25519.buildSignKeyPairFromSeed(seed, nonce);
    const sign: IKeyPairBytes = {
      privateKey: keys.privateKey,
      publicKey: keys.publicKey,
    };
    const encrypt: IKeyPairBytes = {
      privateKey: new Binary(ed2curve.convertSecretKey(keys.privateKey)),
      publicKey: new Binary(ed2curve.convertSecretKey(keys.publicKey)),
    };

    const cypher = new ED25519(sign, encrypt);
    const address = buildRawAddress(sign.publicKey, this.chainId);

    return new Account(cypher, address, sign, encrypt, seed, nonce);
  }

  public createFromPrivateKey(privateKey: string | Uint8Array): Account {
    const keys = AccountFactoryED25519.buildSignKeyPairFromPrivateKey(privateKey);
    const sign: IKeyPairBytes = {
      privateKey: keys.privateKey,
      publicKey: keys.publicKey,
    };
    const encrypt: IKeyPairBytes = {
      privateKey: new Binary(ed2curve.convertSecretKey(keys.privateKey)),
      publicKey: new Binary(ed2curve.convertSecretKey(keys.publicKey)),
    };

    const cypher = new ED25519(sign, encrypt);
    const address = buildRawAddress(sign.publicKey, this.chainId);

    return new Account(cypher, address, sign, encrypt);
  }

  public createFromPublicKey(publicKey: string | Uint8Array): Account {
    const publicKeyBinary = typeof publicKey === 'string' ? Binary.fromBase58(publicKey) : new Binary(publicKey);

    const sign: IKeyPairBytes = {
      publicKey: publicKeyBinary,
    };
    const encrypt: IKeyPairBytes = {
      publicKey: ed2curve.convertSecretKey(publicKeyBinary),
    };

    const cypher = new ED25519(sign, encrypt);
    const address = buildRawAddress(sign.publicKey, this.chainId);

    return new Account(cypher, address, sign, encrypt);
  }

  public create(numberOfWords = 15): Account {
    return this.createFromSeed(generateNewSeed(numberOfWords));
  }

  private static buildSignKeyPairFromSeed(seed: string, nonce: number | Uint8Array): IKeyPairBytes {
    if (!seed || typeof seed !== 'string') throw new Error('Missing or invalid seed phrase');

    const seedBytes = new Binary(seed);
    const seedHash = AccountFactoryED25519.buildSeedHash(seedBytes, AccountFactory.nonce(nonce));
    const keys = nacl.sign.keyPair.fromSeed(seedHash);

    console.log(seedBytes, seedHash, keys);

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
