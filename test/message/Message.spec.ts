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
      const message = new Message('test').encryptFor(recipient).signWith(sender);
      const binary = message.toBinary();

      expect(binary).to.be.instanceOf(Uint8Array);
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

  describe('toJson', () => {
    it('should return the message as a JSON object', () => {
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

  describe('fromJson', () => {
    it('should create a Message instance from a JSON object', () => {
      const data: IMessageJSON = {
        type: 'message',
        sender: { keyType: 'ed25519', publicKey: '3ct1eeZg1ryzz24VHk4CigJxW6Adxh7Syfm459CmGNv2' },
        recipient: '3MsAuZ59xHHa5vmoPG45fBGC7PxLCYQZnbM',
        timestamp: '2023-06-20T21:40:40.268Z',
        signature: '362PiaufpQotrVjXJNQFF9HQ3cqKnmgwD3LzkX3PCWHRzqjUGAQxrWPfCC2irvFUqrM4YkWq9jpv6QYiPJMHTDCJ',
        encryptedData: 'VuQ5544fbeodXVy86g9yk8zVgCjNNXqrMVOAou9d8SQM+2PF/CPuUm/rWEoB5OHSc40H2V3DheEiqkQ9di66NQ==',
      };

      const message = Message.fromJson(data);

      expect(message.type).to.equal(data.type);
      expect(message.sender.keyType).to.equal(data.sender.keyType);
      expect(message.sender.publicKey.base58).to.equal(data.sender.publicKey);
      expect(message.recipient).to.equal(data.recipient);
      expect(message.timestamp).to.be.instanceOf(Date);
      expect(message.signature.base58).to.equal(data.signature);

      message.decryptWith(recipient);
      expect(message.mediaType).to.equal('text/plain');
      expect(message.data?.toString()).to.equal('test');
    });
  });
});
