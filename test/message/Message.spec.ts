// noinspection DuplicatedCode

import { expect } from 'chai';
import { Message } from '../../src/messages';
import { AccountFactoryED25519 as AccountFactory } from '../../src/accounts';
import Binary from '../../src/Binary';
import { IMessageJSON, IMessageMetatype } from '../../src/types';
import { MAX_THUMBNAIL_SIZE } from '../../src/constants';

const MESSAGE_V1 = 0;
const MESSAGE_V2 = 1;

describe('Message', () => {
  const seed = 'satisfy sustain shiver skill betray mother appear pupil coconut weasel firm top puzzle monkey seek';
  const accountFactory = new AccountFactory('T');
  const sender = accountFactory.createFromSeed(seed, 0);
  const recipient = accountFactory.createFromSeed(seed, 1);

  describe('constructor', () => {
    it('should initialize a version 1 message without metadata', () => {
      const message = new Message('test');
      expect(message.version).to.equal(MESSAGE_V1);
      expect(message.data.toString()).to.equal('test');
      expect(message.mediaType).to.equal('text/plain');
    });

    it('should initialize a version 2 message when metadata is present', () => {
      const meta: IMessageMetatype = { title: 'Example', description: 'A test message' };
      const message = new Message('test', 'text/plain', meta);

      expect(message.version).to.equal(MESSAGE_V2);
      expect(message.meta).to.deep.equal(meta);
    });

    it('should initialize the message as string', () => {
      const message = new Message('test');

      expect(message.data.toString()).to.equal('test');
      expect(message.mediaType).to.equal('text/plain');
    });

    it('should initialize the message as string and mediaType', () => {
      const message = new Message('test', 'application/yaml');

      expect(message.data.toString()).to.equal('test');
      expect(message.mediaType).to.equal('application/yaml');
    });

    it('should initialize the message with Binary data', () => {
      const data = new Binary('test');
      const message = new Message(data);

      expect(message.data.toString()).to.equal('test');
      expect(message.mediaType).to.equal('application/octet-stream');
    });

    it('should initialize the message with Binary data and mediaType', () => {
      const data = new Binary('test');
      const mediaType = 'text/plain';
      const message = new Message(data, mediaType);

      expect(message.data.toString()).to.equal('test');
      expect(message.mediaType).to.equal(mediaType);
    });

    it('should initialize the message with Uint8Array', () => {
      const data = new TextEncoder().encode('test');
      const message = new Message(data);

      expect(message.data.toString()).to.equal('test');
      expect(message.mediaType).to.equal('application/octet-stream');
    });

    it('should initialize the message with JSON data', () => {
      const data = { message: 'test' };
      const message = new Message(data);

      expect(message.data).to.deep.equal(new Binary(JSON.stringify(data)));
      expect(message.mediaType).to.equal('application/json');
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
      expect(message.data?.toString()).to.equal('test');
      expect(message.mediaType).to.equal('text/plain');
      expect(message.verifySignature()).to.be.true;
    });

    it('should correctly encode and decode a V2 message', () => {
      const original = new Message('test', 'text/plain', {
        title: 'Test Title',
        description: 'Test Description',
      })
        .to(recipient)
        .signWith(sender);

      const binary = original.toBinary();
      const message = Message.from(binary);

      expect(message.version).to.equal(MESSAGE_V2);
      expect(message.sender).to.deep.equal(original.sender);
      expect(message.recipient).to.equal(original.recipient);
      expect(message.timestamp?.toISOString()).to.equal(original.timestamp?.toISOString());
      expect(message.meta?.title).to.equal('Test Title');
      expect(message.meta?.description).to.equal('Test Description');
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
  });

  describe('hash', () => {
    it('should return the message hash', () => {
      const message = new Message('test').to(recipient).signWith(sender);
      expect(message.hash.hex).to.equal(new Binary(message.toBinary(false)).hash().hex);
      expect(message.verifyHash()).to.be.true;
    });

    it('should return false if the message hash is not valid', () => {
      const message = new Message('test').to(recipient).signWith(sender);
      message.data = new Binary('modified');
      expect(message.verifyHash()).to.be.false;
    });
  });

  describe('toJSON & fromJSON', () => {
    it('should correctly serialize and deserialize a V1 message', () => {
      const message = new Message('test').to(recipient).signWith(sender);
      const json = message.toJSON();
      const reconstructed = Message.from(json);

      expect(reconstructed.sender).to.deep.equal(message.sender);
      expect(reconstructed.recipient).to.equal(message.recipient);
      expect(reconstructed.timestamp?.toISOString()).to.equal(message.timestamp?.toISOString());
      expect(reconstructed.data?.toString()).to.equal('test');
      expect(reconstructed.mediaType).to.equal('text/plain');
    });

    it('should correctly serialize and deserialize a V2 message', () => {
      const message = new Message('test', 'text/plain', {
        title: 'Test Title',
        description: 'Test Description',
      })
        .to(recipient)
        .signWith(sender);

      const json = message.toJSON();
      const reconstructed = Message.from(json);

      expect(reconstructed.sender).to.deep.equal(message.sender);
      expect(reconstructed.recipient).to.equal(message.recipient);
      expect(reconstructed.timestamp?.toISOString()).to.equal(message.timestamp?.toISOString());
      expect(reconstructed.meta?.title).to.equal('Test Title');
      expect(reconstructed.meta?.description).to.equal('Test Description');
      expect(reconstructed.mediaType).to.equal('text/plain');
    });
  });

  describe('withMeta', () => {
    it('should allow adding metadata to a message', () => {
      const thumbnail = new Binary(new Uint8Array([1, 2, 3, 4, 5]));
      const message = new Message('test').withMeta({
        title: 'Example Title',
        description: 'Test Description',
        thumbnail,
      });

      expect(message.meta?.title).to.equal('Example Title');
      expect(message.meta?.description).to.equal('Test Description');
      expect(message.meta?.thumbnail?.toString()).to.equal(thumbnail.toString());
      expect(message.version).to.equal(1);
    });

    it('should throw an error if title and description are both missing', () => {
      const message = new Message('test');
      expect(() => message.withMeta({})).to.throw('At least title and description must be provided.');
    });

    it('should enforce thumbnail size limit', () => {
      const largeThumbnail = new Binary(new Uint8Array(MAX_THUMBNAIL_SIZE + 1));
      const message = new Message('test');

      expect(() =>
        message.withMeta({
          title: 'Test Title',
          description: 'Test Description',
          thumbnail: largeThumbnail,
        }),
      ).to.throw(`Thumbnail exceeds maximum size of ${MAX_THUMBNAIL_SIZE / 1024} KB`);
    });
  });
});
