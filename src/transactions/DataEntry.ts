import * as convert from "../utils/convert";
import {concatUint8Arrays} from "../utils/concat";

enum DataEntryType {
    'integer' = 'integer',
    'boolean' = 'boolean',
    'binary' = 'binary',
    'string' = 'string',
}
type DataEntryValue = number|boolean|Uint8Array|string;

export default class DataEntry {
    key: string;
    type: DataEntryType;
    value: DataEntryValue;

    constructor(key: string, type: string, value: DataEntryValue) {
        this.key = key;
        this.type = type as DataEntryType;
        this.value = DataEntry.guard(this.type, value);
    }

    toBinary(): Uint8Array {
        const keyBytes = Uint8Array.from(convert.stringToByteArray(this.key));

        return concatUint8Arrays(
            Uint8Array.from(convert.shortToByteArray(keyBytes.length)),
            keyBytes, this.valueToBinary()
        );
    }

    valueToBinary(): Uint8Array {
        switch (this.type) {
            case 'integer':
                return concatUint8Arrays(
                    Uint8Array.from([0]),
                    Uint8Array.from(convert.integerToByteArray(this.value as number))
                );
            case 'boolean':
                return concatUint8Arrays(
                    Uint8Array.from([1]),
                    Uint8Array.from([+(this.value as boolean)])
                );
            case 'binary':
                return concatUint8Arrays(Uint8Array.from([2]), this.value as Uint8Array);
            case 'string':
                return concatUint8Arrays(
                    Uint8Array.from([3]),
                    Uint8Array.from(convert.stringToByteArray(this.value as string))
                );
        }
    }

    toJson(): {key: string, type: string, value: DataEntryValue} {
        return {
            key: this.key,
            type: this.type,
            value: this.value
        }
    }

    static fromData(data: {key: string, type: string, value: DataEntryValue}): DataEntry {
        return new DataEntry(data.key, data.type, data.value)
    }

    static guess(key: string, value: any): DataEntry {
        if (typeof value === 'number') return new DataEntry(key, 'integer', value);
        if (typeof value === 'boolean') return new DataEntry(key, 'boolean', value);
        if (typeof value === 'string') return new DataEntry(key, 'string', value);
        if (value instanceof Uint8Array) return new DataEntry(key, 'binary', value);

        throw Error("Type not recognized");
    }

    protected static guard(type: DataEntryType, value: DataEntryValue): DataEntryValue {
        switch (type) {
            case 'integer': return value as number;
            case 'boolean': return value as boolean;
            case 'binary':  return value as Uint8Array;
            case 'string':  return value as string;
        }
    }
}
