import Account from './Account';
import { int32ToBytes } from '../utils/bytes';

export default abstract class AccountFactory {
  protected constructor(readonly networkId: string) {}

  abstract createFromPublicKey(publicKey: string | Uint8Array): Account;

  abstract createFromPrivateKey(privateKey: string | Uint8Array): Account;

  abstract createFromSeed(seed: string, nonce?: number | Uint8Array): Account;

  abstract create(): Account;

  protected static nonce(nonce: number | Uint8Array): Uint8Array {
    return typeof nonce === 'number' ? int32ToBytes(nonce) : nonce;
  }
}
