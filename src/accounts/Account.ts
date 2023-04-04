import { IKeyPairBytes, ISignable, ISigner, TKeyType } from '../../interfaces';
import { Encoding, encode } from '../utils/encoder';
import { Cypher } from './Cypher';
import Binary from '../Binary';
import { SEED_ENCRYPTION_ROUNDS } from '../constants';
import { encryptSeed } from '../utils/encrypt-seed';
import { buildRawAddress, getNetwork } from '../utils/crypto';
import { strToBytes } from '../utils/bytes';
import { ethereumAddress, solanaAddress, cosmosAddress } from '../utils/external-address';

export default class Account implements ISigner {
  /**
   * LTO Wallet Address
   */
  public readonly address: string;

  /**
   * LTO Network ID
   */
  public readonly networkId: string;

  /**
   * Binary public and private key for signing
   */
  public readonly signKey: IKeyPairBytes;

  /**
   * Binary public and private key for encryption
   */
  public readonly encryptKey: IKeyPairBytes;

  /**
   * Class for signing and verifying signatures
   */
  public readonly cypher: Cypher;

  /**
   * Account key type
   */
  public readonly keyType: TKeyType;

  /**
   * Seed phrase
   */
  public readonly seed: string;

  /**
   * The nonce is used in combination with the seed to generate the private key
   */
  public readonly nonce: number | Binary;

  /**
   * Account that will for pay txs this account signs
   */
  public parent?: Account;

  constructor(
    cypher: Cypher,
    address: string,
    sign: IKeyPairBytes,
    encrypt?: IKeyPairBytes,
    seed?: string,
    nonce: number | Uint8Array = 0,
  ) {
    this.cypher = cypher;
    this.keyType = cypher.keyType;
    this.address = address;
    this.networkId = getNetwork(address);
    this.signKey = sign;
    this.encryptKey = encrypt;
    this.seed = seed;
    this.nonce = typeof nonce === 'number' ? nonce : new Binary(nonce);
  }

  /**
   * Get encrypted seed with a password
   */
  public encryptSeed(password: string): string {
    if (!this.seed) throw new Error('Account seed unknown');
    return encryptSeed(this.seed, password, SEED_ENCRYPTION_ROUNDS);
  }

  /**
   * Get encoded seed
   */
  public encodeSeed(encoding = Encoding.base58): string {
    if (!this.seed) throw new Error('Account seed unknown');
    return encode(strToBytes(this.seed), encoding);
  }

  private signMessage(message: string | Uint8Array): Binary {
    return new Binary(this.cypher.createSignature(new Binary(message)));
  }

  /**
   * Sign a message
   */
  public sign(message: string | Uint8Array): Binary;
  public sign<T extends ISignable>(subject: T): T;
  public sign(input: string | Uint8Array | ISignable): Binary | ISignable {
    return typeof input === 'object' && 'signWith' in input ? input.signWith(this) : this.signMessage(input);
  }

  /**
   * Verify a signature with a message
   */
  public verify(message: string | Uint8Array, signature: Uint8Array): boolean {
    return this.cypher.verifySignature(new Binary(message), signature);
  }

  /**
   * Encrypt a message for a particular recipient
   */
  public encryptFor(recipient: Account, message: string | Uint8Array): Binary {
    return new Binary(this.cypher.encryptMessage(new Binary(message), recipient.encryptKey.publicKey));
  }

  /**
   * Decrypt a message from a sender
   */
  public decryptFrom(sender: Account, message: Uint8Array): Binary {
    return new Binary(this.cypher.decryptMessage(message, sender.encryptKey.publicKey));
  }

  /**
   * Base58 encoded public sign key
   */
  public get publicKey(): string {
    return this.signKey.publicKey.base58;
  }

  /**
   * Base58 encoded private sign key
   */
  public get privateKey(): string {
    return this.signKey.privateKey.base58;
  }

  /**
   * Get LTO DID of account
   */
  public get did(): string {
    return 'lto:did:' + this.address;
  }

  public getAddressOnNetwork(network: string): string {
    const [namespace, reference] = network.split(':');

    if (['eip155', 'solana', 'cosmos'].includes(namespace) && this.keyType !== 'secp256k1') {
      throw new Error(`Unsupported key type ${this.keyType} for network ${network}`);
    }

    if (namespace === 'lto') return buildRawAddress(this.signKey.publicKey, reference || 'L');
    if (namespace === 'ethereum' || namespace === 'eip155') return ethereumAddress(this.signKey.publicKey, reference);
    if (namespace === 'solana') return solanaAddress(this.signKey.publicKey, reference || 'mainnet-beta');
    if (namespace === 'cosmos') return cosmosAddress(this.signKey.publicKey);

    throw new Error(`Unsupported network: ${network}`);
  }
}
