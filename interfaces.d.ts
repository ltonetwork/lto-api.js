export type TBinary = Uint8Array | number[];
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
  readonly dataView: DataView;
  toString(): string;
  hash(): IBinary;
  hmac(key: string | Uint8Array): IBinary;
  slice(start?: number, end?: number): IBinary;
  reverse(): IBinary;
  toReversed(): IBinary;
}

export interface IKeyPairBytes {
  privateKey?: IBinary;
  publicKey: IBinary;
}

export type IPair<T> = {
  key: T;
  value: T;
};

export interface ITxJSON extends Record<string, any> {
  type: number;
}

export interface IEventChainJSON extends Record<string, any> {
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
  attachments?: Array<{ name: string; mediaType: string; data: string }>;
}

export interface IMessageMeta {
  type: string;
  title: string;
  description: string;
  thumbnail?: IBinary;
}

interface IMessageJSONBase {
  version: number;
  meta: {
    type: string;
    title: string;
    description: string;
    thumbnail?: string;
  };
  sender: IPublicAccount;
  recipient: string;
  timestamp: Date | string;
  signature?: string;
  hash?: string;
}

interface IMessageJSONEncrypted extends IMessageJSONBase {
  encryptedData: string;
}

interface IMessageJSONUnencrypted extends IMessageJSONBase {
  mediaType: string;
  data: string;
}

export type IMessageJSON = IMessageJSONEncrypted | IMessageJSONUnencrypted;

export interface ITransfer {
  recipient: string;
  amount: number;
}

export interface IDIDService {
  id?: string;
  type: string;
  serviceEndpoint: string | Record<string, any> | Array<string | Record<string, any>>;
  description?: string;
  [key: string]: any;
}

export type TDIDRelationship =
  | 'authentication'
  | 'assertionMethod'
  | 'keyAgreement'
  | 'capabilityInvocation'
  | 'capabilityDelegation';

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
