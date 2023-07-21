import Transaction from './Transaction';
import { concatBytes } from '@noble/hashes/utils';
import { base58 } from '@scure/base';
import * as convert from '../utils/convert';
import { keyTypeId } from '../utils/crypto';
import { ITxJSON } from '../types';
import { default as DataEntry, dictToData } from './DataEntry';
import Binary from '../Binary';

const BASE_FEE = 50000000;
const VAR_FEE = 10000000;
const VAR_BYTES = 256;
const DEFAULT_VERSION = 3;

export default class Data extends Transaction {
  static readonly TYPE = 12;

  data: DataEntry[] = [];

  constructor(data: Record<string, number | boolean | string | Uint8Array> | DataEntry[]) {
    super(Data.TYPE, DEFAULT_VERSION);

    this.data = Array.isArray(data) ? data : dictToData(data);
    this.fee = BASE_FEE + Math.ceil(this.dataToBinary().length / VAR_BYTES) * VAR_FEE;
  }

  private dataToBinary(): Uint8Array {
    return this.data.reduce(
      (binary: Uint8Array, entry: DataEntry) => concatBytes(binary, entry.toBinary()),
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
      convert.shortToByteArray(this.data.length),
      this.dataToBinary(),
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
      data: this.data.map((entry) => entry.toJSON()),
      proofs: this.proofs,
      height: this.height,
    };
  }

  get dict(): Record<string, number | boolean | string | Binary> {
    const dictionary: Record<string, number | boolean | string | Binary> = {};
    this.data.forEach((entry) => (dictionary[entry.key] = entry.value));
    return dictionary;
  }

  static from(data: ITxJSON): Data {
    const tx = new Data([]).initFrom(data);
    tx.data = (data.data ?? []).map(DataEntry.from);

    return tx;
  }
}
