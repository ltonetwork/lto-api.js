import Transaction from './Transaction';
import { concatBytes } from '@noble/hashes/utils';
import { base58 } from '@scure/base';
import * as convert from '../utils/convert';
import { keyTypeId } from '../utils/crypto';
import { ISigner, ITxJSON } from '../types';

const DEFAULT_FEE = 500000000;
const DEFAULT_VERSION = 3;

export default class CancelSponsorship extends Transaction {
  static readonly TYPE = 19;

  recipient: string;

  constructor(recipient: string | ISigner) {
    super(CancelSponsorship.TYPE, DEFAULT_VERSION, DEFAULT_FEE);
    this.recipient = typeof recipient === 'string' ? recipient : recipient.address;
  }

  private toBinaryV1(): Uint8Array {
    return concatBytes(
      Uint8Array.from([this.type, this.version]),
      convert.stringToByteArray(this.networkId),
      base58.decode(this.senderPublicKey!),
      base58.decode(this.recipient),
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
      base58.decode(this.recipient),
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
      recipient: this.recipient,
      timestamp: this.timestamp,
      fee: this.fee,
      proofs: this.proofs,
      height: this.height,
    };
  }

  static from(data: ITxJSON): CancelSponsorship {
    return new CancelSponsorship(data.recipient).initFrom(data);
  }
}
