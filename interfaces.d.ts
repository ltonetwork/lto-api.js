import Transaction from "./src/transactions/Transaction";
import PublicNode from "./src/node/PublicNode";


export type TBuffer = Uint8Array | number[];

export interface IHash<T> {
  [key: string]: T;
}

export interface IVerifiableCredentials {
  [key: string]: any;
  populate(data: object): void;
  issue(subject: object, issuer: object): void;
  registerTo(node: PublicNode): Promise<Transaction>;
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

export interface ISigner {
  sign(message: string|Uint8Array): IBinary;
  address: string;
  publicKey: string;
  keyType: string;
}

export interface ISignable {
  signWith(account: ISigner): this;
}

export interface IProofable {
  canonicalize(): string;
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
  hash(): IBinary;
}

export interface IKeyPairBytes {
  privateKey?: IBinary;
  publicKey: IBinary;
}

export interface ITxJSON extends IHash<any> {
  type: number;
}

export interface IEventChainJSON extends IHash<any> {
  id: string;
  events: IEventJSON[];
}

export interface IEventJSON {
  timestamp: number;
  previous: string;
  signkey?: string;
  signature?: string;
  hash?: string;
  mediaType: string,
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
declare module "*.js" {
  const content: {
    [key: string]: any;
  };
  export = content;
}
