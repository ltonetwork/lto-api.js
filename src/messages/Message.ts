import { IBinary, IMessageJSON, TKeyType } from '../../interfaces';
import Binary from '../Binary';
import { Account, cypher } from '../accounts';
import { concatBytes } from '@noble/hashes/utils';
import { keyTypeId } from '../utils/crypto';
import { base58 } from '@scure/base';
import * as convert from '../utils/convert';
import { stringToByteArrayWithSize } from '../utils/convert';

export default class Message {
  /** Meta type of the data */
  public mediaType?: string;

  /** Data of the message */
  public data?: IBinary;

  /** Time when the message was signed */
  public timestamp?: Date;

  /** Key and its type used to sign the event */
  public sender?: { keyType: TKeyType; publicKey: IBinary };

  /** Signature of the message */
  public signature?: IBinary;

  /** Address of the recipient */
  public recipient?: string;

  private encryptedData?: IBinary;

  constructor(data: any, mediaType?: string) {
    if (typeof data === 'string') {
      this.mediaType = mediaType ?? 'text/plain';
      this.data = new Binary(data);
    } else if (data instanceof Binary) {
      this.mediaType = mediaType ?? 'application/octet-stream';
      this.data = data;
    } else {
      if (mediaType && mediaType !== 'application/json') throw new Error(`Unable to encode data as ${mediaType}`);

      this.mediaType = mediaType ?? 'application/json';
      this.data = new Binary(JSON.stringify(data));
    }
  }

  encryptFor(recipient: Account): Message {
    this.recipient = recipient.address;
    this.encryptedData = recipient.encrypt(concatBytes(stringToByteArrayWithSize(this.mediaType), this.data));

    return this;
  }

  decryptWith(account: Account): Message {
    if (!this.encryptedData) throw new Error('Message is not encrypted');

    const content = account.decrypt(this.encryptedData);

    const mediaTypeLength = (content[0] << 8) | content[1];
    this.mediaType = content.slice(2, mediaTypeLength + 2).toString();
    this.data = content.slice(mediaTypeLength + 2);

    return this;
  }

  signWith(sender: Account): Message {
    this.sender = { keyType: sender.keyType, publicKey: sender.signKey.publicKey };
    this.timestamp = new Date();
    this.signature = sender.sign(this.toBinary());

    return this;
  }

  public verifySignature(): boolean {
    if (!this.signature || !this.sender) throw new Error('Message is not signed');

    return cypher(this.sender).verifySignature(this.toBinary(), this.signature);
  }

  toBinary(): Uint8Array {
    if (!this.recipient) throw new Error('Recipient not set');
    if (!this.sender || !this.timestamp) throw new Error('Message not signed');

    return concatBytes(
      Uint8Array.from([keyTypeId(this.sender.keyType)]),
      this.sender.publicKey,
      base58.decode(this.recipient),
      convert.longToByteArray(this.timestamp.getTime()),
      this.encryptedData ?? Uint8Array.from([]),
    );
  }

  toJSON(): IMessageJSON {
    return {
      sender: this.sender ? { keyType: this.sender.keyType, publicKey: this.sender.publicKey.base58 } : undefined,
      recipient: this.recipient,
      timestamp: this.timestamp,
      signature: this.signature?.base58,
      encryptedData: this.encryptedData?.base64,
    };
  }

  static fromJson(json: IMessageJSON): Message {
    const message: Message = Object.create(Message.prototype);

    message.sender = {
      keyType: json.sender.keyType,
      publicKey: Binary.fromBase58(json.sender.publicKey),
    };
    message.recipient = json.recipient;
    message.timestamp = json.timestamp instanceof Date ? json.timestamp : new Date(json.timestamp);
    message.signature = Binary.fromBase58(json.signature);

    message.encryptedData = Binary.fromBase64(json.encryptedData);

    return message;
  }
}
