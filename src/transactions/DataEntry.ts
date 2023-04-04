import * as convert from '../utils/convert';
import { concatBytes } from '../utils/bytes';
import Binary from '../Binary';
import { IHash } from '../../interfaces';

type DataEntryType = 'integer' | 'boolean' | 'binary' | 'string';
type DataEntryValue = number | boolean | Binary | string;
type DataEntryValueIn = number | boolean | Uint8Array | string;

export default class DataEntry {
  public key: string;
  public type: DataEntryType;
  public value: DataEntryValue;

  constructor(key: string, type: DataEntryType, value: DataEntryValueIn) {
    this.key = key;
    this.type = type;
    this.value = DataEntry.guard(key, type, value);
  }

  public toBinary(): Uint8Array {
    const keyBytes = convert.stringToByteArray(this.key);

    return concatBytes(convert.shortToByteArray(keyBytes.length), keyBytes, this.valueToBinary());
  }

  private valueToBinary(): Uint8Array {
    switch (this.type) {
      case 'integer':
        return concatBytes(Uint8Array.from([0]), convert.integerToByteArray(this.value as number));
      case 'boolean':
        return concatBytes(Uint8Array.from([1]), Uint8Array.from([+(this.value as boolean)]));
      case 'binary':
        return concatBytes(Uint8Array.from([2]), this.value as Uint8Array);
      case 'string':
        return concatBytes(Uint8Array.from([3]), convert.stringToByteArray(this.value as string));
    }
  }

  public toJSON(): { key: string; type: string; value: DataEntryValue } {
    return {
      key: this.key,
      type: this.type,
      value: this.value instanceof Binary ? 'base64:' + this.value.base64 : this.value,
    };
  }

  public static from(data: { key: string; type: DataEntryType; value: DataEntryValue }): DataEntry {
    const value =
      data.type === 'binary' && typeof data.value === 'string' && data.value.startsWith('base64:')
        ? Binary.fromBase64(data.value.substr(7))
        : data.value;

    return new DataEntry(data.key, data.type, value);
  }

  public static guess(key: string, value: any): DataEntry {
    if (typeof value === 'number') return new DataEntry(key, 'integer', value);
    if (typeof value === 'boolean') return new DataEntry(key, 'boolean', value);
    if (typeof value === 'string') return new DataEntry(key, 'string', value);
    if (value instanceof Uint8Array) return new DataEntry(key, 'binary', value);

    throw Error('Type not recognized');
  }

  protected static guard(key: string, type: DataEntryType, value: DataEntryValueIn): DataEntryValue {
    switch (type) {
      case 'integer':
        if (typeof value !== 'number') throw Error(`Invalid value for data entry '${key}' of type ${type}`);
        return value;
      case 'boolean':
        if (typeof value !== 'boolean') throw Error(`Invalid value for data entry '${key}' of type ${type}`);
        return value;
      case 'binary':
        if (!(value instanceof Uint8Array)) throw Error(`Invalid value for data entry '${key}' of type ${type}`);
        return new Binary(value);
      case 'string':
        if (typeof value !== 'string') throw Error(`Invalid value for data entry '${key}' of type ${type}`);
        return value;
      default:
        throw Error(`Unsupported data entry type ${type}`);
    }
  }
}

export function dictToData(dictionary: IHash<number | boolean | string | Uint8Array>): DataEntry[] {
  const data: Array<DataEntry> = [];

  for (const key in dictionary) {
    data.push(DataEntry.guess(key, dictionary[key]));
  }

  return data;
}
