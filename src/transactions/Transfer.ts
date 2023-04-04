import Transaction from './Transaction';
import { concatBytes } from '../utils/bytes';
import { base58 } from '@scure/base';
import * as convert from '../utils/convert';
import { keyTypeId } from '../utils/crypto';
import { ISigner, ITxJSON } from '../../interfaces';
import Binary from '../Binary';

const DEFAULT_FEE = 100000000;
const DEFAULT_VERSION = 3;

export default class Transfer extends Transaction {
  public static readonly TYPE = 4;

  public recipient: string;
  public amount: number;
  public attachment: Binary;

  constructor(recipient: string | ISigner, amount: number, attachment: Uint8Array | string = '') {
    super(Transfer.TYPE, DEFAULT_VERSION, DEFAULT_FEE);

    this.recipient = typeof recipient === 'string' ? recipient : recipient.address;
    this.amount = amount;
    this.attachment = new Binary(attachment);
  }

  private toBinaryV2(): Uint8Array {
    return concatBytes(
      Uint8Array.from([this.type, this.version]),
      base58.decode(this.senderPublicKey!),
      convert.longToByteArray(this.timestamp!),
      convert.longToByteArray(this.amount),
      convert.longToByteArray(this.fee),
      base58.decode(this.recipient),
      convert.shortToByteArray(this.attachment.length),
      this.attachment,
    );
  }

  private toBinaryV3(): Uint8Array {
    return concatBytes(
      Uint8Array.from([this.type, this.version]),
      convert.stringToByteArray(this.chainId),
      convert.longToByteArray(this.timestamp!),
      Uint8Array.from([keyTypeId(this.senderKeyType)]),
      base58.decode(this.senderPublicKey!),
      convert.longToByteArray(this.fee),
      base58.decode(this.recipient),
      convert.longToByteArray(this.amount),
      convert.shortToByteArray(this.attachment.length),
      this.attachment,
    );
  }

  public toBinary(): Uint8Array {
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

  public toJSON(): ITxJSON {
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
      amount: this.amount,
      recipient: this.recipient,
      attachment: this.attachment.base58,
      proofs: this.proofs,
      height: this.height,
    };
  }

  public static from(data: ITxJSON): Transfer {
    const attachment = data.attachment ? Binary.fromBase58(data.attachment) : '';
    return new Transfer(data.recipient, data.amount, attachment).initFrom(data);
  }
}
