export type TBinary = Uint8Array | number[];
export type TKeyType = 'ed25519' | 'secp256k1' | 'secp256r1';

export interface IHash<T> {
  [key: string]: T;
}

export interface IAccountIn {
  address?: string;
  publicKey?: string | Uint8Array;
  privateKey?: string | Uint8Array;
  keyType?: string;
  seed?: string;
  seedPassword?: string;
  nonce?: number | Uint8Array;
  parent?: {
    seed: string;
    keyType?: string;
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

export interface IProofable {
  canonicalize(): string;
}

export interface IPublicAccount {
  keyType: TKeyType;
  publicKey: string;
}

export interface IKeyPair {
  privateKey?: string;
  publicKey: string;
}

export interface IBinary extends Uint8Array {
  readonly base58: string;
  readonly base64: string;
  readonly hex: string;
  toString(): string;
  hash(): IBinary;
  slice(start?: number, end?: number): IBinary;
  reverse(): IBinary;
}

export interface IKeyPairBytes {
  privateKey?: IBinary;
  publicKey: IBinary;
}

export type IPair<T> = {
  key: T;
  value: T;
};

export interface ITxJSON extends IHash<any> {
  type: number;
}

export interface IEventChainJSON extends IHash<any> {
  id: string;
  events: Array<IEventJSON | { hash: string; state: string }>;
}

export interface IEventJSON {
  timestamp?: number;
  previous?: string;
  signKey?: IPublicAccount;
  signature?: string;
  hash?: string;
  mediaType: string;
  data: string;
}

export interface ITransfer {
  recipient: string;
  amount: number;
}

// Missing interfaces
declare global {
  interface Window {
    msCrypto?: any;
    Response?: any;
    Promise: PromiseConstructor;
  }

  interface ErrorConstructor {
    captureStackTrace(thisArg: any, func: any): void;
  }
}

// Replacement for --allowJs
declare module '*.js' {
  const content: {
    [key: string]: any;
  };
  export = content;
}
