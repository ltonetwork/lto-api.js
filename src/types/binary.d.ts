export type TBinary = Uint8Array | number[];

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
