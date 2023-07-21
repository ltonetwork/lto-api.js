import { IKeyPairBytes, ISignable, ISigner, TKeyType } from '../types';
import { Cypher } from './Cypher';
import Binary from '../Binary';
import { SEED_ENCRYPTION_ROUNDS } from '../constants';
import { encryptSeed, buildAddress, getNetwork } from '../utils';
import { ethereumAddress } from '../utils/external-address';

export default class Account implements ISigner {
  readonly networkId: string;
  readonly keyType: TKeyType;
  readonly nonce: number | Binary;

  parent?: Account;

  constructor(
    readonly cypher: Cypher,
    readonly address: string,
    readonly signKey: IKeyPairBytes,
    readonly encryptKey: IKeyPairBytes,
    readonly seed?: string,
    nonce: number | Uint8Array = 0,
  ) {
    this.keyType = cypher.keyType;
    this.networkId = getNetwork(address);
    this.nonce = typeof nonce === 'number' ? nonce : new Binary(nonce);
  }

  /**
   * Get encrypted seed with a password
   */
  encryptSeed(password: string): string {
    if (!this.seed) throw new Error('Account seed unknown');
    return encryptSeed(this.seed, password, SEED_ENCRYPTION_ROUNDS);
  }

  private signMessage(message: string | Uint8Array): Binary {
    return new Binary(this.cypher.createSignature(new Binary(message)));
  }

  /**
   * Sign a message
   */
  sign(message: string | Uint8Array): Binary;
  sign<T extends ISignable>(subject: T): T;
  sign(input: string | Uint8Array | ISignable): Binary | ISignable {
    return typeof input === 'object' && 'signWith' in input ? input.signWith(this) : this.signMessage(input);
  }

  /**
   * Verify a signature with a message
   */
  verify(message: string | Uint8Array, signature: Uint8Array): boolean {
    return this.cypher.verifySignature(new Binary(message), signature);
  }

  /**
   * Encrypt a message with the account's public key.
   * This message can only be decrypted with the account's private key.
   */
  encrypt(message: string | Uint8Array): Binary {
    const encrypted = this.cypher.encryptMessage(new Binary(message));
    return encrypted instanceof Binary ? encrypted : new Binary(encrypted);
  }

  /**
   * Decrypt a message with the account's private key.
   * This message can only be encrypted with the account's public key.
   */
  decrypt(message: Uint8Array): Binary {
    const decrypted = this.cypher.decryptMessage(message);
    return decrypted instanceof Binary ? decrypted : new Binary(decrypted);
  }

  /**
   * Base58 encoded public sign key
   */
  get publicKey(): string {
    return this.signKey.publicKey.base58;
  }

  /**
   * Base58 encoded private sign key
   */
  get privateKey(): string {
    return this.signKey.privateKey.base58;
  }

  /**
   * Get LTO DID of account
   */
  get did(): string {
    return 'did:lto:' + this.address;
  }

  getAddressOnNetwork(network: string): string {
    const [namespace, reference] = network.split(':');

    if (['ethereum', 'eip155', 'solana', 'cosmos'].includes(namespace) && this.keyType !== 'secp256k1') {
      throw new Error(`Unsupported key type ${this.keyType} for network ${network}`);
    }

    if (namespace === 'lto') return buildAddress(this.signKey.publicKey, reference || 'L');
    if (namespace === 'ethereum' || namespace === 'eip155') return ethereumAddress(this.signKey.publicKey, reference);

    throw new Error(`Unsupported network: ${network}`);
  }
}
