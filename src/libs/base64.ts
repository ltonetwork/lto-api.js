import { TBuffer } from '../../interfaces';

declare const Buffer;

export default {

  encode(buffer: TBuffer): string {
    return Buffer.from(String.fromCharCode.apply(null, buffer), 'binary').toString('base64')
  }
};