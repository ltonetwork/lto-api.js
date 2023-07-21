import Transaction from './Transaction';
import { concatBytes } from '@noble/hashes/utils';
import { base58 } from '@scure/base';
import * as convert from '../utils/convert';
import { keyTypeId } from '../utils/crypto';
import { ITxJSON } from '../types';

const DEFAULT_FEE = 100000000;
const DEFAULT_VERSION = 3;

export default class CancelLease extends Transaction {
  static readonly TYPE = 9;

  leaseId: string;

  constructor(leaseId: string) {
    super(CancelLease.TYPE, DEFAULT_VERSION, DEFAULT_FEE);
    this.leaseId = leaseId;
  }

  private toBinaryV2(): Uint8Array {
    return concatBytes(
      Uint8Array.from([this.type, this.version]),
      convert.stringToByteArray(this.networkId),
      base58.decode(this.senderPublicKey!),
      convert.longToByteArray(this.fee),
      convert.longToByteArray(this.timestamp!),
      Uint8Array.from(base58.decode(this.leaseId)),
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
      Uint8Array.from(base58.decode(this.leaseId)),
    );
  }

  toBinary(): Uint8Array {
    if (!this.sender) throw Error('Transaction sender not set');

    switch (this.version) {
      case 2:
        return this.toBinaryV2();
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
      proofs: this.proofs,
      leaseId: this.leaseId,
      height: this.height,
    };
  }

  static from(data: ITxJSON): CancelLease {
    return new CancelLease(data.leaseId).initFrom(data);
  }
}
