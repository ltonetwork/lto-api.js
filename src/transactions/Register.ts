import Transaction from './Transaction';
import { concatBytes } from '@noble/hashes/utils';
import { base58 } from '@scure/base';
import * as convert from '../utils/convert';
import { keyTypeId } from '../utils/crypto';
import { IPublicAccount, ISigner, ITxJSON } from '../types';

const BASE_FEE = 25000000;
const VAR_FEE = 10000000;
const DEFAULT_VERSION = 3;

export default class Register extends Transaction {
  static readonly TYPE = 20;

  accounts: IPublicAccount[];

  constructor(...accounts: (IPublicAccount | ISigner)[]) {
    super(Register.TYPE, DEFAULT_VERSION, BASE_FEE + accounts.length * VAR_FEE);
    this.accounts = accounts.map(this.accountToDict);

    if (this.accounts.length > 100) throw new Error('Too many accounts');
  }

  accountToDict(account: IPublicAccount | ISigner): IPublicAccount {
    return { keyType: account.keyType, publicKey: account.publicKey };
  }

  private accountsToBinary(): Uint8Array {
    return this.accounts.reduce(
      (binary: Uint8Array, account: IPublicAccount) =>
        concatBytes(binary, Uint8Array.from([keyTypeId(account.keyType)]), base58.decode(account.publicKey)),
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
      convert.shortToByteArray(this.accounts.length),
      this.accountsToBinary(),
    );
  }

  toBinary(): Uint8Array {
    if (!this.sender) throw Error('Transaction sender not set');

    switch (this.version) {
      case 3:
        return this.toBinaryV3();
      default:
        throw new Error('Incorrect version');
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
      accounts: this.accounts,
      proofs: this.proofs,
      height: this.height,
    };
  }

  static from(data: ITxJSON): Register {
    return new Register(...data.accounts).initFrom(data);
  }
}
