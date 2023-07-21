import Transaction from './Transaction';
import { concatBytes } from '@noble/hashes/utils';
import { base58 } from '@scure/base';
import * as convert from '../utils/convert';
import { keyTypeId } from '../utils/crypto';
import { ITxJSON } from '../types';
import Binary from '../Binary';

const BASE_FEE = 25000000;
const VAR_FEE = 10000000;
const DEFAULT_VERSION = 3;

export default class Anchor extends Transaction {
  static readonly TYPE = 15;

  anchors: Binary[] = [];

  constructor(...anchors: Uint8Array[]) {
    super(Anchor.TYPE, DEFAULT_VERSION, BASE_FEE + anchors.length * VAR_FEE);
    this.anchors = anchors.map((anchor) => new Binary(anchor));
  }

  /** Get binary for anchors as used by toBinary methods */
  private anchorsBinary(): Uint8Array {
    return this.anchors.reduce(
      (current: Uint8Array, binary: Uint8Array): Uint8Array =>
        concatBytes(current, convert.shortToByteArray(binary.length), binary),
      new Uint8Array(),
    );
  }

  private toBinaryV1(): Uint8Array {
    return concatBytes(
      Uint8Array.from([this.type, this.version]),
      base58.decode(this.senderPublicKey!),
      convert.shortToByteArray(this.anchors.length),
      this.anchorsBinary(),
      convert.longToByteArray(this.timestamp!),
      convert.longToByteArray(this.fee),
    );
  }

  private toBinaryV3(): Uint8Array {
    return concatBytes(
      Uint8Array.from([this.type, this.version]),
      convert.stringToByteArray(this.networkId),
      convert.longToByteArray(this.timestamp!),
      Uint8Array.from([keyTypeId(this.senderKeyType)]),
      base58.decode(this.senderPublicKey!),
      convert.longToByteArray(this.fee),
      convert.shortToByteArray(this.anchors.length),
      this.anchorsBinary(),
    );
  }

  toBinary(): Uint8Array {
    if (!this.sender) throw Error('Transaction sender not set');

    switch (this.version) {
      case 1:
        return this.toBinaryV1();
      case 3:
        return this.toBinaryV3();
      default:
        throw Error('Incorrect version');
    }
  }

  toJSON(): ITxJSON {
    return {
      id: this.id,
      type: this.type,
      version: this.version,
      sender: this.sender,
      senderKeyType: this.senderKeyType,
      senderPublicKey: this.senderPublicKey,
      sponsor: this.sponsor,
      sponsorKeyType: this.sponsorKeyType,
      sponsorPublicKey: this.sponsorPublicKey,
      fee: this.fee,
      timestamp: this.timestamp,
      anchors: this.anchors.map((anchor) => anchor.base58),
      proofs: this.proofs,
      height: this.height,
    };
  }

  static from(data: ITxJSON): Anchor {
    const anchors = (data.anchors ?? []).map(Binary.fromBase58);
    return new Anchor(...anchors).initFrom(data);
  }
}
