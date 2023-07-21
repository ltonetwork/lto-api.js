import Transaction from './Transaction';
import { concatBytes } from '@noble/hashes/utils';
import { base58 } from '@scure/base';
import * as convert from '../utils/convert';
import { keyTypeId } from '../utils/crypto';
import { ITransfer, ITxJSON } from '../types';
import Binary from '../Binary';

const BASE_FEE = 100000000;
const VAR_FEE = 10000000;
const DEFAULT_VERSION = 3;

export default class MassTransfer extends Transaction {
  static readonly TYPE = 11;

  transfers: ITransfer[];
  attachment: Binary;

  constructor(transfers: ITransfer[], attachment: Uint8Array | string = '') {
    super(MassTransfer.TYPE, DEFAULT_VERSION, BASE_FEE + transfers.length * VAR_FEE);

    this.transfers = transfers;
    this.attachment = new Binary(attachment);
  }

  private transferBinary(): Uint8Array {
    return this.transfers.reduce(
      (binary: Uint8Array, transfer: ITransfer) =>
        concatBytes(binary, base58.decode(transfer.recipient), convert.longToByteArray(transfer.amount)),
      new Uint8Array(),
    );
  }

  private toBinaryV1(): Uint8Array {
    return concatBytes(
      Uint8Array.from([this.type, this.version]),
      base58.decode(this.senderPublicKey!),
      convert.shortToByteArray(this.transfers.length),
      this.transferBinary(),
      convert.longToByteArray(this.timestamp!),
      convert.longToByteArray(this.fee),
      convert.shortToByteArray(this.attachment.length),
      this.attachment,
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
      convert.shortToByteArray(this.transfers.length),
      this.transferBinary(),
      convert.shortToByteArray(this.attachment.length),
      this.attachment,
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
      transfers: this.transfers,
      attachment: this.attachment.base58,
      proofs: this.proofs,
      height: this.height,
    };
  }

  static from(data: ITxJSON): MassTransfer {
    const attachment = data.attachment ? Binary.fromBase58(data.attachment) : '';
    return new MassTransfer(data.transfers, attachment).initFrom(data);
  }
}
