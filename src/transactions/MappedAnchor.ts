import Transaction from './Transaction';
import { concatBytes } from '@noble/hashes/utils';
import { base58 } from '@scure/base';
import * as convert from '../utils/convert';
import { keyTypeId } from '../utils/crypto';
import { IBinary, IPair, ITxJSON } from '../types';
import Binary from '../Binary';

const BASE_FEE = 25000000;
const VAR_FEE = 10000000;
const DEFAULT_VERSION = 3;

export default class MappedAnchor extends Transaction {
  static readonly TYPE = 22;

  anchors: IPair<IBinary>[];

  constructor(...anchors: IPair<Uint8Array>[]) {
    super(MappedAnchor.TYPE, DEFAULT_VERSION, BASE_FEE + anchors.length * VAR_FEE);
    this.anchors = anchors.map((pair) => ({ key: new Binary(pair.key), value: new Binary(pair.value) }));
  }

  /** Get binary for anchors as used by toBinary methods */
  private anchorsBinary(): Uint8Array {
    return this.anchors.reduce(
      (current: Uint8Array, pair: IPair<Uint8Array>): Uint8Array =>
        concatBytes(
          current,
          convert.shortToByteArray(pair.key.length),
          pair.key,
          convert.shortToByteArray(pair.value.length),
          pair.value,
        ),
      new Uint8Array(),
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
      case 3:
        return this.toBinaryV3();
      default:
        throw Error('Incorrect version');
    }
  }

  toJSON(): ITxJSON {
    const anchors: Record<string, string> = {};
    this.anchors.forEach((pair) => (anchors[pair.key.base58] = pair.value.base58));

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
      anchors,
      proofs: this.proofs,
      height: this.height,
    };
  }

  static from(data: ITxJSON): MappedAnchor {
    const anchors = Object.entries(data.anchors).map(([key, value]) => ({
      key: Binary.fromBase58(key),
      value: Binary.fromBase58(value as string),
    }));

    return new MappedAnchor(...anchors).initFrom(data);
  }
}
