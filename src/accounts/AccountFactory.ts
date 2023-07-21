import Account from './Account.js';
import { int32ToBytes } from '../utils/bytes.js';

export default abstract class AccountFactory {
  readonly chainId: string;

  protected constructor(chainId: string) {
    this.chainId = chainId;
  }

  abstract createFromPublicKey(publicKey: string | Uint8Array): Account;

  abstract createFromPrivateKey(privateKey: string | Uint8Array): Account;

  abstract createFromSeed(seed: string, nonce?: number | Uint8Array): Account;

  abstract create(): Account;

  protected static nonce(nonce: number | Uint8Array): Uint8Array {
    return typeof nonce === 'number' ? int32ToBytes(nonce) : nonce;
  }
}
