import Transaction from './Transaction';
import { concatBytes, strToBytes } from '../utils/bytes';
import * as base58 from '../libs/base58';
import * as convert from '../utils/convert';
import { keyTypeId } from '../utils/crypto';
import { IHash, ISigner, ITxJSON } from '../../interfaces';
import Binary from '../Binary';
import { default as DataEntry, dictToData } from './DataEntry';

const BASE_FEE = 50000000;
const VAR_FEE = 10000000;
const VAR_BYTES = 256;
const DEFAULT_VERSION = 3;

export default class Association extends Transaction {
  public static readonly TYPE = 16;

  public recipient: string;
  public associationType: number;
  public subject?: Binary;
  public expires?: number;
  public data: DataEntry[] = [];

  constructor(
    associationType: number,
    recipient: string | ISigner,
    subject?: Uint8Array,
    expires?: number | Date,
    data: IHash<number | boolean | string | Uint8Array> | DataEntry[] = [],
  ) {
    super(Association.TYPE, DEFAULT_VERSION);

    this.recipient = typeof recipient === 'string' ? recipient : recipient.address;
    this.associationType = associationType;
    if (subject) this.subject = new Binary(subject);
    this.expires = expires instanceof Date ? expires.getTime() : expires;

    this.data = Array.isArray(data) ? data : dictToData(data);
    this.fee = BASE_FEE + Math.ceil(this.dataToBinary().length / VAR_BYTES) * VAR_FEE;
  }

  private dataToBinary(): Uint8Array {
    return this.data.reduce(
      (binary: Uint8Array, entry: DataEntry) => concatBytes(binary, entry.toBinary()),
      new Uint8Array(),
    );
  }

  private toBinaryV1(): Uint8Array {
    const subjectBinary = this.subject
      ? concatBytes(Uint8Array.from([1]), convert.shortToByteArray(this.subject.length), this.subject)
      : Uint8Array.from([0]);

    return concatBytes(
      Uint8Array.from([this.type, this.version]),
      convert.stringToByteArray(this.chainId),
      base58.decode(this.senderPublicKey!),
      base58.decode(this.recipient),
      convert.integerToByteArray(this.associationType),
      subjectBinary,
      convert.longToByteArray(this.timestamp!),
      convert.longToByteArray(this.fee),
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
      convert.integerToByteArray(this.associationType),
      convert.longToByteArray(this.expires ?? 0),
      convert.shortToByteArray(this.subject?.length ?? 0),
      this.subject ?? new Uint8Array(),
    );
  }

  private toBinaryV4(): Uint8Array {
    return concatBytes(
      Uint8Array.from([this.type, this.version]),
      Uint8Array.from(strToBytes(this.chainId)),
      Uint8Array.from(convert.longToByteArray(this.timestamp!)),
      Uint8Array.from([keyTypeId(this.senderKeyType)]),
      base58.decode(this.senderPublicKey!),
      Uint8Array.from(convert.longToByteArray(this.fee)),
      Uint8Array.from(convert.longToByteArray(this.associationType)),
      base58.decode(this.recipient),
      Uint8Array.from(convert.longToByteArray(this.expires ?? 0)),
      Uint8Array.from(convert.shortToByteArray(this.subject?.length ?? 0)),
      this.subject ?? new Uint8Array(),
      Uint8Array.from(convert.shortToByteArray(this.data.length)),
      this.dataToBinary(),
    );

    /*return concatBytes(
			Uint8Array.from([this.type, this.version]),
			convert.stringToByteArray(this.chainId),
			convert.longToByteArray(this.timestamp!),
			Uint8Array.from([keyTypeId(this.senderKeyType)]),
			base58.decode(this.senderPublicKey!),
			convert.longToByteArray(this.fee),
			convert.longToByteArray(this.associationType),
			base58.decode(this.recipient),
			convert.longToByteArray(this.expires ?? 0),
			convert.shortToByteArray(this.subject?.length ?? 0),
			this.subject ?? new Uint8Array(),
			convert.shortToByteArray(this.data.length),
			this.dataToBinary()
		);*/
  }

  public toBinary(): Uint8Array {
    if (!this.sender) throw Error('Transaction sender not set');

    switch (this.version) {
      case 1:
        return this.toBinaryV1();
      case 3:
        return this.toBinaryV3();
      case 4:
        return this.toBinaryV4();
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
      associationType: this.associationType,
      recipient: this.recipient,
      expires: this.expires,
      subject: this.subject?.base58,
      data: this.data.length > 0 ? this.data.map((entry) => entry.toJSON()) : undefined,
      proofs: this.proofs,
      height: this.height,
    };
  }

  public get dict(): IHash<number | boolean | string | Binary> {
    const dictionary: IHash<number | boolean | string | Binary> = {};
    this.data.forEach((entry) => (dictionary[entry.key] = entry.value));
    return dictionary;
  }

  public static from(data: ITxJSON): Association {
    const tx = new Association(
      data.associationType,
      data.recipient,
      data.subject ? Binary.fromBase58(data.subject) : undefined,
      data.expires,
    ).initFrom(data);

    tx.data = (data.data ?? []).map(DataEntry.from);

    return tx;
  }
}
