import { IBinary } from './binary';

export type TKeyType = 'ed25519' | 'secp256k1' | 'secp256r1';

export interface IAccountIn {
  address?: string;
  publicKey?: string | Uint8Array;
  privateKey?: string | Uint8Array;
  keyType?: string;
  seed?: string;
  seedPassword?: string;
  nonce?: number | string | Uint8Array;
  derivationPath?: string;
  parent?: {
    seed?: string;
    keyType?: TKeyType;
  };
}

export interface ISigner {
  sign(message: string | Uint8Array): IBinary;
  address: string;
  publicKey: string;
  keyType: TKeyType;
}

export interface ISignable {
  signWith(account: ISigner): this;
}

export interface IPublicAccount {
  keyType: TKeyType;
  publicKey: string;
}
