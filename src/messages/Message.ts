import { IBinary, IMessageJSON, IMessageMeta, TKeyType } from '../../interfaces';
import Binary from '../Binary';
import { Account, cypher } from '../accounts';
import { concatBytes } from '@noble/hashes/utils';
import { keyTypeFromId, keyTypeId } from '../utils/crypto';
import { base58 } from '@scure/base';
import {
  byteArrayToLong,
  byteArrayWithSizeToBytes,
  bytesToByteArrayWithSize,
  longToByteArray,
  stringToByteArrayWithSize,
  byteToByteArray,
  booleanToBytes,
} from '../utils/convert';
import { DEFAULT_MESSAGE_TYPE, MAX_THUMBNAIL_SIZE } from '../constants';

const MESSAGE_V1 = 0;
const MESSAGE_V2 = 1; // Meta data support

export default class Message {
  /** Version of the message */
  version: number;

  /** Extra info and details about the message */
  meta: IMessageMeta = { type: DEFAULT_MESSAGE_TYPE, title: '', description: '' };

  /** Meta type of the data */
  mediaType: string;

  /** Data of the message */
  data: IBinary;

  /** Time when the message was signed */
  timestamp?: Date;

  /** Key and its type used to sign the event */
  sender?: { keyType: TKeyType; publicKey: IBinary };

  /** Signature of the message */
  signature?: IBinary;

  /** Address of the recipient */
  recipient?: string;

  /** Hash (see dynamic property) */
  private _hash?: IBinary;

  /** Encrypted data */
  private _encryptedData?: IBinary;

  constructor(data: any, mediaType?: string, meta: Partial<IMessageMeta> | string = {}) {
    if (typeof meta === 'string') meta = { type: meta }; // Backwards compatibility

    this.version = meta.title || meta.description || meta.thumbnail ? MESSAGE_V2 : MESSAGE_V1;
    this.meta = { ...this.meta, ...meta };

    if (typeof data === 'string') {
      this.mediaType = mediaType ?? 'text/plain';
      this.data = new Binary(data);
    } else if (data instanceof Uint8Array) {
      this.mediaType = mediaType ?? 'application/octet-stream';
      this.data = data instanceof Binary ? data : new Binary(data);
    } else {
      if (mediaType && mediaType !== 'application/json') throw new Error(`Unable to encode data as ${mediaType}`);
      this.mediaType = mediaType ?? 'application/json';
      this.data = new Binary(JSON.stringify(data));
    }
  }

  get type(): string {
    return this.meta.type; // Backwards compatibility
  }

  get hash(): Binary {
    return this._hash ?? new Binary(this.toBinary(false)).hash();
  }

  get encryptedData(): Binary {
    if (!this._encryptedData) throw new Error('Message is not encrypted');
    return this._encryptedData;
  }

  to(recipient: string | Account): Message {
    if (this.signature) throw new Error('Message is already signed');

    this.recipient = typeof recipient === 'string' ? recipient : recipient.address;
    return this;
  }

  encryptFor(recipient: Account): Message {
    if (this.signature) throw new Error('Message is already signed');

    this.recipient = recipient.address;
    this._encryptedData = recipient.encrypt(concatBytes(stringToByteArrayWithSize(this.mediaType), this.data));

    return this;
  }

  decryptWith(account: Account): Message {
    if (!this._encryptedData) throw new Error('Message is not encrypted');

    const content = account.decrypt(this._encryptedData);

    const mediaTypeLength = (content[0] << 8) | content[1];
    this.mediaType = content.slice(2, mediaTypeLength + 2).toString();
    this.data = content.slice(mediaTypeLength + 2);

    return this;
  }

  isEncrypted(): boolean {
    return !!this._encryptedData;
  }

  signWith(sender: Account): Message {
    this.timestamp ??= new Date();
    this.sender = { keyType: sender.keyType, publicKey: sender.signKey.publicKey };
    this.signature = sender.sign(this.toBinary(false));
    this._hash = this.hash;
    return this;
  }

  isSigned(): boolean {
    return !!this.signature;
  }

  verifySignature(): boolean {
    if (!this.signature || !this.sender) throw new Error('Message is not signed');
    return cypher(this.sender).verifySignature(this.toBinary(false), this.signature);
  }

  verifyHash(): boolean {
    return this._hash === undefined || this._hash.hex === new Binary(this.toBinary(false)).hash().hex;
  }

  private toBinaryV1(withSignature = true): Uint8Array {
    if (this.meta?.title || this.meta?.description || this.meta?.thumbnail) {
      throw new Error('Meta information is not supported in v1');
    }

    const data = this._encryptedData
      ? bytesToByteArrayWithSize(this._encryptedData, 'int32')
      : concatBytes(stringToByteArrayWithSize(this.mediaType, 'int16'), bytesToByteArrayWithSize(this.data, 'int32'));

    return concatBytes(
      byteToByteArray(MESSAGE_V1),
      stringToByteArrayWithSize(this.meta.type, 'int8'),
      byteToByteArray(keyTypeId(this.sender.keyType)),
      this.sender.publicKey,
      base58.decode(this.recipient),
      longToByteArray(this.timestamp?.getTime() || 0),
      booleanToBytes(!!this._encryptedData),
      data,
      withSignature && this.signature ? this.signature : new Uint8Array(0),
    );
  }

  private toBinaryV2(withSignature = true): Uint8Array {
    const data = this._encryptedData
      ? bytesToByteArrayWithSize(this._encryptedData, 'int32')
      : concatBytes(stringToByteArrayWithSize(this.mediaType, 'int16'), bytesToByteArrayWithSize(this.data, 'int32'));

    return concatBytes(
      byteToByteArray(MESSAGE_V2),
      stringToByteArrayWithSize(this.meta.type, 'int8'),
      stringToByteArrayWithSize(this.meta.title, 'int8'),
      stringToByteArrayWithSize(this.meta.description, 'int16'),
      bytesToByteArrayWithSize(this.meta.thumbnail || new Uint8Array(0), 'int32'),
      byteToByteArray(keyTypeId(this.sender.keyType)),
      this.sender.publicKey,
      base58.decode(this.recipient),
      longToByteArray(this.timestamp?.getTime() || 0),
      booleanToBytes(!!this._encryptedData),
      data,
      withSignature && this.signature ? this.signature : new Uint8Array(0),
    );
  }

  toBinary(withSignature = true): Uint8Array {
    if (!this.recipient) {
      throw new Error('Recipient not set');
    }

    if (this.meta.thumbnail?.length > MAX_THUMBNAIL_SIZE) {
      throw new Error(`Thumbnail exceeds maximum size of ${MAX_THUMBNAIL_SIZE / 1024} KB`);
    }

    if (!this.signature && withSignature) {
      throw new Error('Message not signed');
    }

    if (!this.sender || !this.sender.keyType) {
      throw new Error('Sender key type is missing');
    }

    return this.version === MESSAGE_V1 ? this.toBinaryV1(withSignature) : this.toBinaryV2(withSignature);
  }

  toJSON(): IMessageJSON {
    const base = {
      version: this.version,
      meta: {
        type: this.meta.type,
        title: this.meta.title,
        description: this.meta.description,
        thumbnail: this.meta.thumbnail?.base64,
      },
      sender: this.sender ? { keyType: this.sender.keyType, publicKey: this.sender.publicKey.base58 } : undefined,
      recipient: this.recipient,
      timestamp: this.timestamp,
      signature: this.signature?.base58,
      hash: this.hash.base58,
    };

    if (this.version === MESSAGE_V1) {
      (base as any).type = this.meta.type; // Backwards compatibility
    }

    return this._encryptedData
      ? { ...base, encryptedData: 'base64:' + this._encryptedData?.base64 }
      : { ...base, mediaType: this.mediaType, data: 'base64:' + this.data?.base64 };
  }

  static from(data: IMessageJSON | Uint8Array): Message {
    return data instanceof Uint8Array ? this.fromBinary(data) : this.fromJSON(data);
  }

  private static fromJSON(json: IMessageJSON): Message {
    const message: Message = Object.create(Message.prototype);

    if ('version' in json && json.version > MESSAGE_V2) {
      throw new Error(`Message version ${json.version} not supported`);
    }

    if (!('version' in json)) {
      message.version = MESSAGE_V1;
      message.meta = { type: (json as any).type, title: '', description: '' }; // Backwards compatibility
    } else {
      message.version = json.version;
      message.meta = { type: json.meta.type, title: json.meta.title, description: json.meta.description };
      message.meta.thumbnail = json.meta.thumbnail ? Binary.fromBase64(json.meta.thumbnail) : undefined;
    }

    message.sender = {
      keyType: json.sender.keyType,
      publicKey: Binary.fromBase58(json.sender.publicKey),
    };
    message.recipient = json.recipient;
    message.timestamp = json.timestamp instanceof Date ? json.timestamp : new Date(json.timestamp);

    if (json.signature) message.signature = Binary.fromBase58(json.signature);
    if (json.hash) message._hash = Binary.fromBase58(json.hash);

    if ('encryptedData' in json) {
      message._encryptedData =
        typeof json.encryptedData === 'string' && json.encryptedData.startsWith('base64:')
          ? Binary.fromBase64(json.encryptedData.slice(7))
          : new Binary(json.encryptedData);
    } else {
      message.mediaType = json.mediaType;
      message.data =
        typeof json.data === 'string' && json.data.startsWith('base64:')
          ? Binary.fromBase64(json.data.slice(7))
          : new Binary(json.data);
    }

    return message;
  }

  private static fromBinary(data: Uint8Array): Message {
    const message: Message = Object.create(Message.prototype);
    message.meta = { type: '', title: '', description: '' };
    let offset = 0;

    // version
    message.version = data[offset++];

    if (message.version > MESSAGE_V2) {
      throw new Error(`Message version ${message.version} not supported`);
    }

    // meta.type
    const typeLength = data[offset++];
    const typeBytes = data.slice(offset, offset + typeLength);
    message.meta.type = new TextDecoder().decode(typeBytes);
    offset += typeLength;

    if (message.version === MESSAGE_V2) {
      // meta.title
      const titleLength = data[offset++];
      const titleBytes = data.slice(offset, offset + titleLength);
      message.meta.title = new TextDecoder().decode(titleBytes);
      offset += titleLength;

      // meta.description
      const descriptionLength = byteArrayToLong(data.slice(offset, offset + 2));
      offset += 2;
      const descriptionBytes = data.slice(offset, offset + descriptionLength);
      message.meta.description = new TextDecoder().decode(descriptionBytes);
      offset += descriptionLength;

      // meta.thumbnail
      const thumbnailLength = byteArrayToLong(data.slice(offset, offset + 4));
      offset += 4;
      if (thumbnailLength > 0) {
        message.meta.thumbnail = new Binary(data.slice(offset, offset + thumbnailLength));
        offset += thumbnailLength;
      }
    }

    // sender
    const senderKeyType = data[offset++];
    const senderPublicKeyLength = senderKeyType === 1 ? 32 : 33;
    const senderPublicKey = data.slice(offset, offset + senderPublicKeyLength);
    message.sender = { keyType: keyTypeFromId(senderKeyType), publicKey: new Binary(senderPublicKey) };
    offset += senderPublicKeyLength;

    // recipient
    message.recipient = base58.encode(data.slice(offset, offset + 26));
    offset += 26;

    // timestamp
    const timestampBytes = data.slice(offset, offset + 8);
    message.timestamp = new Date(byteArrayToLong(timestampBytes));
    offset += 8;

    const encrypted = data[offset++] === 1;

    if (encrypted) {
      // encrypted data
      message._encryptedData = new Binary(byteArrayWithSizeToBytes(data.slice(offset), 'int32'));
      offset += message._encryptedData.length + 4;
    } else {
      // mediaType
      const mediaTypeBytes = byteArrayWithSizeToBytes(data.slice(offset), 'int16');
      message.mediaType = new TextDecoder().decode(mediaTypeBytes);
      offset += mediaTypeBytes.length + 2;

      // data
      message.data = new Binary(byteArrayWithSizeToBytes(data.slice(offset), 'int32'));
      offset += message.data.length + 4;
    }

    // signature
    if (offset < data.length) {
      message.signature = new Binary(data.slice(offset));
    }

    return message;
  }
}
