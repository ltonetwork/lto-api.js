// noinspection DuplicatedCode

import { expect } from 'chai';
import { Message } from '../../src/messages';
import { AccountFactoryED25519 as AccountFactory } from '../../src/accounts';
import Binary from '../../src/Binary';
import { IMessageJSON } from '../../interfaces';

describe('Message', () => {
  const seed = 'satisfy sustain shiver skill betray mother appear pupil coconut weasel firm top puzzle monkey seek';
  const accountFactory = new AccountFactory('T');
  const sender = accountFactory.createFromSeed(seed, 0);
  const recipient = accountFactory.createFromSeed(seed, 1);

  describe('constructor', () => {
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

  describe('toBinary', () => {
    it('should return the message as a binary representation', () => {
      const message = new Message('test');
      message.timestamp = new Date('2023-01-01T00:00:00.000Z');
      message.to(recipient);
      message.signWith(sender);

      const binary = message.toBinary();

      expect(binary).to.be.instanceOf(Uint8Array);
      expect(new Binary(binary).hex).to.equal(
        '00076d6573736167650126e86176189975fcd29ea0b912a9f7b8f8ef668815fe131ff1507a2664d273ef015423b61593a085a642b8c63e509aa65e74eadafada8acf462c000001856aa0c80000000a746578742f706c61696e000474657374e766c689c518af03672b1b61149f059d5262007f07de30c2d53e9168b4296f14ed0940fbe36415841123b505fd646cebccdce8f6c8d60f7028161cec5d677b08',
      );
    });

    it('should throw an error if the recipient is not set', () => {
      const message = new Message('test');
      expect(() => message.toBinary()).to.throw('Recipient not set');
    });

    it('should throw an error if the message is not signed', () => {
      const message = new Message('test').encryptFor(recipient);
      expect(() => message.toBinary()).to.throw('Message not signed');
    });
  });

  describe('fromBinary', () => {
    it('should create a message from a binary representation', () => {
      const original = new Message('test');
      original.to(recipient);
      original.signWith(sender);

      const binary = original.toBinary();

      const message = Message.fromBinary(binary);
      expect(message.isEncrypted()).to.be.false;

      expect(message.sender).to.deep.equal({
        keyType: sender.keyType,
        publicKey: sender.signKey.publicKey,
      });
      expect(message.recipient).to.equal(recipient.address);
      expect(message.timestamp.toISOString()).to.equal(original.timestamp.toISOString());

      expect(message.data?.toString()).to.equal('test');
      expect(message.mediaType).to.equal('text/plain');

      expect(message.signature.hex).to.equal(original.signature.hex);
      expect(message.verifySignature()).to.be.true;

      expect(message.hash.hex).to.equal(original.hash.hex);
    });

    it('should create an encrypted message from a binary representation', () => {
      const original = new Message('test');
      original.encryptFor(recipient);
      original.signWith(sender);

      const binary = original.toBinary();

      const message = Message.fromBinary(binary);
      expect(message.isEncrypted()).to.be.true;

      expect(message.sender).to.deep.equal({
        keyType: sender.keyType,
        publicKey: sender.signKey.publicKey,
      });
      expect(message.recipient).to.equal(recipient.address);
      expect(message.timestamp.toISOString()).to.equal(original.timestamp.toISOString());

      expect(message.signature.hex).to.equal(original.signature.hex);
      expect(message.verifySignature()).to.be.true;

      expect(message.hash.hex).to.equal(original.hash.hex);

      message.decryptWith(recipient);
      expect(message.data?.toString()).to.equal('test');
      expect(message.mediaType).to.equal('text/plain');
    });
  });

  describe('hash', () => {
    it('should return the message hash', () => {
      const message = new Message('test');
      message.timestamp = new Date('2023-01-01T00:00:00.000Z');
      message.to(recipient);
      message.signWith(sender);

      expect(message.hash.hex).to.equal('733fea4c7f5270634b56230d4425700eb765db4445ad4193a6ebc760bc21c0cb');
      expect(message.verifyHash()).to.be.true;
    });

    it('should return false if the message hash is not valid', () => {
      const message = new Message('test');
      message.timestamp = new Date('2023-01-01T00:00:00.000Z');
      message.to(recipient);
      message.signWith(sender);

      // Change the message after it has been signed
      message.data = new Binary('other');

      expect(message.verifyHash()).to.be.false;
    });
  });

  describe('toJson', () => {
    it('should return an unencrypted message as a JSON object', () => {
      const message = new Message('test').to(recipient).signWith(sender);

      const data = JSON.parse(JSON.stringify(message));

      expect(data.type).to.equal('message');
      expect(data.sender).to.deep.equal({
        keyType: sender.keyType,
        publicKey: sender.signKey.publicKey.base58,
      });
      expect(data.recipient).to.equal(recipient.address);
      expect(data.timestamp).to.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/);
      expect(data.signature).to.equal(message.signature.base58);
      expect(data.mediaType).to.equal('text/plain');
      expect(data.data).to.equal(new Binary('test').base64);
    });

    it('should return an encrypted message as a JSON object', () => {
      const message = new Message('test').encryptFor(recipient).signWith(sender);

      const data = JSON.parse(JSON.stringify(message));

      expect(data.type).to.equal('message');
      expect(data.sender).to.deep.equal({
        keyType: sender.keyType,
        publicKey: sender.signKey.publicKey.base58,
      });
      expect(data.recipient).to.equal(recipient.address);
      expect(data.timestamp).to.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/);
      expect(data.signature).to.equal(message.signature.base58);
      expect(data.encryptedData).to.exist;
    });
  });

  describe('from', () => {
    it('should create a Message instance from JSON', () => {
      const data: IMessageJSON = {
        type: 'message',
        sender: { keyType: 'ed25519', publicKey: '3ct1eeZg1ryzz24VHk4CigJxW6Adxh7Syfm459CmGNv2' },
        recipient: '3MsAuZ59xHHa5vmoPG45fBGC7PxLCYQZnbM',
        timestamp: '2023-06-20T21:40:40.268Z',
        signature: '362PiaufpQotrVjXJNQFF9HQ3cqKnmgwD3LzkX3PCWHRzqjUGAQxrWPfCC2irvFUqrM4YkWq9jpv6QYiPJMHTDCJ',
        hash: '35',
        mediaType: 'text/plain',
        data: 'dGVzdA==',
      };

      const message = Message.from(data);

      expect(message.type).to.equal(data.type);
      expect(message.sender.keyType).to.equal(data.sender.keyType);
      expect(message.sender.publicKey.base58).to.equal(data.sender.publicKey);
      expect(message.recipient).to.equal(data.recipient);
      expect(message.timestamp).to.be.instanceOf(Date);
      expect(message.signature.base58).to.equal(data.signature);
      expect(message.hash.base58).to.equal(data.hash);

      expect(message.mediaType).to.equal('text/plain');
      expect(message.data?.toString()).to.equal('test');
    });

    it('should create a Message instance from JSON with encrypted data', () => {
      const data: IMessageJSON = {
        type: 'message',
        sender: { keyType: 'ed25519', publicKey: '3ct1eeZg1ryzz24VHk4CigJxW6Adxh7Syfm459CmGNv2' },
        recipient: '3MsAuZ59xHHa5vmoPG45fBGC7PxLCYQZnbM',
        timestamp: '2023-06-20T21:40:40.268Z',
        signature: '362PiaufpQotrVjXJNQFF9HQ3cqKnmgwD3LzkX3PCWHRzqjUGAQxrWPfCC2irvFUqrM4YkWq9jpv6QYiPJMHTDCJ',
        hash: '35',
        encryptedData: 'VuQ5544fbeodXVy86g9yk8zVgCjNNXqrMVOAou9d8SQM+2PF/CPuUm/rWEoB5OHSc40H2V3DheEiqkQ9di66NQ==',
      };

      const message = Message.from(data);

      expect(message.type).to.equal(data.type);
      expect(message.sender.keyType).to.equal(data.sender.keyType);
      expect(message.sender.publicKey.base58).to.equal(data.sender.publicKey);
      expect(message.recipient).to.equal(data.recipient);
      expect(message.timestamp).to.be.instanceOf(Date);
      expect(message.signature.base58).to.equal(data.signature);
      expect(message.hash.base58).to.equal(data.hash);

      message.decryptWith(recipient);
      expect(message.mediaType).to.equal('text/plain');
      expect(message.data?.toString()).to.equal('test');
    });
  });
});
