// noinspection DuplicatedCode

import { expect } from 'chai';
import { Message } from '../../src/messages';
import { AccountFactoryED25519 as AccountFactory } from '../../src/accounts';
import Binary from '../../src/Binary';
import { MAX_THUMBNAIL_SIZE } from '../../src/constants';

const MESSAGE_V1 = 0;
const MESSAGE_V2 = 1;

describe('Message', () => {
  const seed = 'satisfy sustain shiver skill betray mother appear pupil coconut weasel firm top puzzle monkey seek';
  const accountFactory = new AccountFactory('T');
  const sender = accountFactory.createFromSeed(seed, 0);
  const recipient = accountFactory.createFromSeed(seed, 1);

  describe('constructor', () => {
    it('should initialize a message without metadata', () => {
      const message = new Message('test');
      expect(message.version).to.equal(MESSAGE_V1);
      expect(message.data!.toString()).to.equal('test');
      expect(message.mediaType!).to.equal('text/plain');
      expect(message.meta.type).to.equal('basic');
    });

    it('should initialize a message with a type', () => {
      const message = new Message('test', undefined, 'custom');
      expect(message.version).to.equal(MESSAGE_V1);
      expect(message.data!.toString()).to.equal('test');
      expect(message.mediaType!).to.equal('text/plain');

      expect(message.meta.type).to.equal('custom');
      expect(message.meta.title).to.equal('');
      expect(message.meta.description).to.equal('');
    });

    it('should initialize a message with metadata', () => {
      const thumbnail = new Binary(new Uint8Array([1, 2, 3, 4, 5]));
      const meta = {
        title: 'Example Title',
        description: 'Test Description',
        thumbnail,
      };
      const message = new Message('test', undefined, meta);

      expect(message.version).to.equal(MESSAGE_V2);
      expect(message.data!.toString()).to.equal('test');
      expect(message.mediaType!).to.equal('text/plain');

      expect(message.meta.title).to.equal('Example Title');
      expect(message.meta.description).to.equal('Test Description');
      expect(message.meta.thumbnail?.toString()).to.equal(thumbnail.toString());
    });

    it('should initialize the message as string', () => {
      const message = new Message('test');

      expect(message.data!.toString()).to.equal('test');
      expect(message.mediaType!).to.equal('text/plain');
    });

    it('should initialize the message as string and mediaType', () => {
      const message = new Message('test', 'application/yaml');

      expect(message.data!.toString()).to.equal('test');
      expect(message.mediaType!).to.equal('application/yaml');
    });

    it('should initialize the message with Binary data', () => {
      const data = new Binary('test');
      const message = new Message(data);

      expect(message.data!.toString()).to.equal('test');
      expect(message.mediaType!).to.equal('application/octet-stream');
    });

    it('should initialize the message with Binary data and mediaType', () => {
      const data = new Binary('test');
      const mediaType = 'text/plain';
      const message = new Message(data, mediaType);

      expect(message.data!.toString()).to.equal('test');
      expect(message.mediaType!).to.equal(mediaType);
    });

    it('should initialize the message with Uint8Array', () => {
      const data = new TextEncoder().encode('test');
      const message = new Message(data);

      expect(message.data!.toString()).to.equal('test');
      expect(message.mediaType!).to.equal('application/octet-stream');
    });

    it('should initialize the message with JSON data', () => {
      const data = { message: 'test' };
      const message = new Message(data);

      expect(message.data!).to.deep.equal(new Binary(JSON.stringify(data)));
      expect(message.mediaType!).to.equal('application/json');
    });

    it('should throw an error when mediaType is provided but not "application/json"', () => {
      const data = { message: 'test' };
      const mediaType = 'text/plain';

      expect(() => new Message(data, mediaType)).to.throw('Unable to encode data as text/plain');
    });
  });

  describe('encrypting and decryption', () => {
    let message: Message;

    beforeEach(() => {
      message = new Message('test').encryptFor(recipient);

      // Delete non-encrypted fields
      delete message.data;
      delete message.mediaType;
    });

    it('should encrypt the message for the specified recipient', () => {
      message.decryptWith(recipient);

      expect(message.mediaType).to.equal('text/plain');
      expect(message.data?.toString()).to.equal('test');
    });

    it('should not be able to decrypt the message with a different account', () => {
      const other = accountFactory.createFromSeed(seed, 2);

      expect(() => message.decryptWith(other)).to.throw('Unable to decrypt message with given keys');
    });
  });

  describe('signing', () => {
    it('should sign the message with the specified account', () => {
      const message = new Message('test').encryptFor(recipient).signWith(sender);

      expect(message.sender).to.deep.equal({
        keyType: sender.keyType,
        publicKey: sender.signKey.publicKey,
      });
      expect(message.timestamp).to.be.instanceOf(Date);
      expect(message.signature).to.exist;

      expect(message.verifySignature()).to.be.true;
    });

    it('should throw an error if the message is not signed', () => {
      const message = new Message('test');
      expect(() => message.verifySignature()).to.throw('Message is not signed');
    });
  });

  describe('toBinary & fromBinary', () => {
    it('should correctly encode and decode a V1 message', () => {
      const original = new Message('test').to(recipient).signWith(sender);
      const binary = original.toBinary();
      const message = Message.from(binary);

      expect(message.version).to.equal(MESSAGE_V1);
      expect(message.sender).to.deep.equal(original.sender);
      expect(message.recipient).to.equal(original.recipient);
      expect(message.timestamp?.toISOString()).to.equal(original.timestamp?.toISOString());
      expect(message.data!?.toString()).to.equal('test');
      expect(message.mediaType!).to.equal('text/plain');
      expect(message.verifySignature()).to.be.true;
    });

    it('should correctly encode and decode a V2 message', () => {
      const thumbnail = new Binary(new Uint8Array([1, 2, 3, 4, 5]));

      const original = new Message('test', 'text/plain', {
        title: 'Test Title',
        description: 'Test Description',
        thumbnail,
      })
        .to(recipient)
        .signWith(sender);

      const binary = original.toBinary();
      const message = Message.from(binary);

      expect(message.version).to.equal(MESSAGE_V2);
      expect(message.sender).to.deep.equal(original.sender);
      expect(message.recipient).to.equal(original.recipient);
      expect(message.timestamp?.toISOString()).to.equal(original.timestamp?.toISOString());
      expect(message.meta.title).to.equal('Test Title');
      expect(message.meta.description).to.equal('Test Description');
      expect(message.meta.thumbnail?.toString()).to.equal(thumbnail.toString());
      expect(message.verifySignature()).to.be.true;
    });

    it('should throw an error if recipient is not set before encoding to binary', () => {
      const message = new Message('test');
      expect(() => message.toBinary()).to.throw('Recipient not set');
    });

    it('should throw an error if the message is not signed before encoding to binary', () => {
      const message = new Message('test').to(recipient);
      expect(() => message.toBinary()).to.throw('Message not signed');
    });

    it('should enforce thumbnail size limit', () => {
      const thumbnail = new Binary(new Uint8Array(MAX_THUMBNAIL_SIZE + 1));
      const message = new Message('test', 'text/plain', { thumbnail }).to(recipient);

      expect(message.version).to.equal(MESSAGE_V2);
      expect(() => message.toBinary()).to.throw(`Thumbnail exceeds maximum size of ${MAX_THUMBNAIL_SIZE / 1024} KB`);
    });
  });

  describe('hash', () => {
    it('should return the message hash', () => {
      const message = new Message('test').to(recipient).signWith(sender);
      expect(message.hash.hex).to.equal(new Binary(message.toBinary(false)).hash().hex);
      expect(message.verifyHash()).to.be.true;
    });

    it('should return false if the message hash is not valid', () => {
      const message = new Message('test').to(recipient).signWith(sender);
      message.data! = new Binary('modified');
      expect(message.verifyHash()).to.be.false;
    });
  });

  describe('toJSON & fromJSON', () => {
    it('should correctly serialize and deserialize a V1 message', () => {
      const message = new Message('test').to(recipient).signWith(sender);
      const json = message.toJSON();
      const reconstructed = Message.from(json);

      expect(reconstructed.version).to.equal(MESSAGE_V1);
      expect(reconstructed.meta.type).to.equal('basic');
      expect(reconstructed.meta.title).to.equal('');
      expect(reconstructed.meta.description).to.equal('');
      expect(reconstructed.sender).to.deep.equal(message.sender);
      expect(reconstructed.recipient).to.equal(message.recipient);
      expect(reconstructed.timestamp?.toISOString()).to.equal(message.timestamp?.toISOString());
      expect(reconstructed.mediaType!).to.equal('text/plain');
      expect(reconstructed.data!?.toString()).to.equal('test');

      expect((json as any).type).to.equal('basic'); // Backwards compatibility
    });

    it('should correctly serialize and deserialize a V2 message', () => {
      const thumbnail = new Binary(new Uint8Array([1, 2, 3, 4, 5]));
      const message = new Message('test', 'text/plain', {
        type: 'custom',
        title: 'Test Title',
        description: 'Test Description',
        thumbnail,
      })
        .to(recipient)
        .signWith(sender);

      const json = message.toJSON();
      const reconstructed = Message.from(json);

      expect(reconstructed.version).to.equal(MESSAGE_V2);
      expect(reconstructed.meta.type).to.equal('custom');
      expect(reconstructed.meta.title).to.equal('Test Title');
      expect(reconstructed.meta.description).to.equal('Test Description');
      expect(reconstructed.meta.thumbnail?.toString()).to.equal(thumbnail.toString());
      expect(reconstructed.sender).to.deep.equal(message.sender);
      expect(reconstructed.recipient).to.equal(message.recipient);
      expect(reconstructed.timestamp?.toISOString()).to.equal(message.timestamp?.toISOString());
      expect(reconstructed.mediaType!).to.equal('text/plain');
      expect(reconstructed.data!?.toString()).to.equal('test');
    });

    it('should work with the old message format', () => {
      const json = {
        type: 'basic',
        sender: {
          keyType: 'ed25519',
          publicKey: '3ct1eeZg1ryzz24VHk4CigJxW6Adxh7Syfm459CmGNv2',
        },
        recipient: '3MsAuZ59xHHa5vmoPG45fBGC7PxLCYQZnbM',
        timestamp: '2025-03-12T15:36:04.790Z',
        signature: '5D6zb5yfbps6KBZ18tb1fuWgGzAetKV1Xqghb8kTqV9zNpZrXwo7iZzgWKv2y9dRnwRS61XaH3zE3ufjVMDPwQ7T',
        hash: '2Q4RE9we4NtyLNaKtyLUr6rrsVj1ToJ48xSdyQzNzKC9',
        mediaType: 'text/plain',
        data: 'base64:dGVzdA==',
      };

      const reconstructed = Message.from(json as any);

      expect(reconstructed.version).to.equal(MESSAGE_V1);
      expect(reconstructed.meta.type).to.equal('basic');
      expect(reconstructed.meta.title).to.equal('');
      expect(reconstructed.meta.description).to.equal('');
      expect(reconstructed.mediaType!).to.equal('text/plain');
      expect(reconstructed.data!?.toString()).to.equal('test');
    });
  });
});
