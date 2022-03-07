export type TBuffer = Uint8Array | number[];

export interface IHash<T> {
  [key: string]: T;
}

export interface IAccountIn {
  address?: string;
  publicKey?: string;
  privateKey?: string;
  keyType?: "ed25519" | "secp256k1" | "secp256r1";
  seed?: string;
  seedPassword?: string;
  nonce?: number;
}

export interface IPublicAccount {
  keyType: string;
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
}

export interface IKeyPairBytes {
  privateKey?: IBinary;
  publicKey: IBinary;
}

export interface ITxJSON extends IHash<any> {
  type: number;
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
declare module "*.js" {
  const content: {
    [key: string]: any;
  };
  export = content;
}
