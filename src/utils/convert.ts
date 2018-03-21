import { TBuffer } from '../../interfaces';

import converters from '../libs/converters';


export default {

    booleanToBytes(input: boolean): number[] {

        if (typeof input !== 'boolean') {
            throw new Error('Boolean input is expected');
        }

        return input ? [1] : [0];

    },

    bytesToByteArrayWithSize(input: TBuffer): number[] {

        if (!(input instanceof Array || input instanceof Uint8Array)) {
            throw new Error('Byte array or Uint8Array input is expected');
        } else if (input instanceof Array && !(input.every((n) => typeof n === 'number'))) {
            throw new Error('Byte array contains non-numeric elements');
        }

        if (!(input instanceof Array)) {
            input = Array.prototype.slice.call(input);
        }

        const lengthBytes = converters.int16ToBytes(input.length, true);
        return [...lengthBytes, ...input as Array<number>];

    },

    longToByteArray(input: number): number[] {

        if (typeof input !== 'number') {
            throw new Error('Numeric input is expected');
        }

        const bytes = new Array(7);
        for (let k = 7; k >= 0; k--) {
            bytes[k] = input & (255);
            input = input / 256;
        }

        return bytes;

    },

    stringToByteArray(input: string): number[] {

        if (typeof input !== 'string') {
            throw new Error('String input is expected');
        }

        return converters.stringToByteArray(input);

    },

    stringToByteArrayWithSize(input: string): number[] {

        if (typeof input !== 'string') {
            throw new Error('String input is expected');
        }

        const stringBytes = converters.stringToByteArray(input);
        const lengthBytes = converters.int16ToBytes(stringBytes.length, true);

        return [...lengthBytes, ...stringBytes];

    }

};
