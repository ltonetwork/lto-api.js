import Transaction from './Transaction';
import { base58, base64 } from '@scure/base';
import * as convert from '../utils/convert';
import { concatBytes } from '@noble/hashes/utils';
import { keyTypeId } from '../utils/crypto';
import { ITxJSON } from '../types';

const BASE_FEE = 500000000;
const DEFAULT_VERSION = 3;

export default class SetScript extends Transaction {
  static readonly TYPE = 13;

  script?: string;

  constructor(compiledScript?: string) {
    super(SetScript.TYPE, DEFAULT_VERSION);

    this.script = compiledScript;
    this.fee = BASE_FEE;
  }

  private toBinaryV1(): Uint8Array {
    const scriptBytes = this.script ? base64.decode(this.script.slice(7)) : undefined;

    return concatBytes(
      Uint8Array.from([this.type, 1]),
      convert.stringToByteArray(this.networkId),
      base58.decode(this.senderPublicKey!),
      scriptBytes
        ? concatBytes(Uint8Array.from([1]), convert.shortToByteArray(scriptBytes.length), scriptBytes)
        : Uint8Array.from([0]),
      convert.longToByteArray(this.fee),
      convert.longToByteArray(this.timestamp!),
    );
  }

  private toBinaryV3(): Uint8Array {
    const scriptBytes = this.script ? base64.decode(this.script.slice(7)) : new Uint8Array();

    return concatBytes(
      Uint8Array.from([this.type, this.version]),
      convert.stringToByteArray(this.networkId),
      convert.longToByteArray(this.timestamp!),
      Uint8Array.from([keyTypeId(this.senderKeyType)]),
      base58.decode(this.senderPublicKey!),
      convert.longToByteArray(this.fee),
      convert.shortToByteArray(scriptBytes.length),
      scriptBytes,
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
      script: this.script,
      timestamp: this.timestamp,
      fee: this.fee,
      sponsor: this.sponsor,
      sponsorKeyType: this.sponsorKeyType,
      sponsorPublicKey: this.sponsorPublicKey,
      proofs: this.proofs,
      height: this.height,
    };
  }

  static from(data: ITxJSON): SetScript {
    const tx = new SetScript(data.script);
    return tx.initFrom(data);
  }
}
