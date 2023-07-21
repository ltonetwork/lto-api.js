import { assert } from 'chai';
import { AccountFactoryED25519 } from '../../src/accounts/index.js/';
import { Association } from '../../src/transactions/index.js/';
import { base58 } from '@scure/base';
import Binary from '../../src/Binary';

describe('Association', () => {
  const account = new AccountFactoryED25519('T').createFromSeed('test');
  const recipient = '3NACnKFVN2DeFYjspHKfa2kvDqnPkhjGCD2';
  const associationType = 10;
  const dict = {
    test: 1,
    second: true,
    third: new Binary('foo'),
    fourth: 'hello',
  };
  const subject = Binary.fromHex('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  let transaction: Association;

  beforeEach(() => {
    transaction = new Association(associationType, recipient, subject);
  });

  describe('#toBinary', () => {
    it('should return a binary tx V4', () => {
      transaction = new Association(associationType, recipient, subject, new Date('2030-01-01 00:00:00+00'), dict);
      transaction.version = 4;
      transaction.fee = 100000000; // old default fee
      transaction.timestamp = new Date('2018-03-01T00:00:00+00:00').getTime();
      transaction.signWith(account);

      assert.equal(
        base58.encode(transaction.toBinary()),
        'CN4DFxt3zE3a9ThjXDLfUMNo36TtC3EeSgizWFfDzTXigeE5d36Gw9oVCuwQ4hLyfCRckhAMArcMvJFzNNQExkieT8EhpnMbups1wqQpPUpFCPdA38dCVU4YRVsWEzWCgYxG1XEFryqisze23Jz8K6AQvy5rv4iShtbkbyEddb8W2622CfYyoxq7bTLD3iGygpdu7guuZtqFcjV33aLDVqEk6nHrG3KZePcRXnNJAn13ZqkQDsQhGWu121k',
      );
    });

    it('should return a binary tx V3', () => {
      transaction.version = 3;
      transaction.fee = 100000000; // old default fee
      transaction.timestamp = new Date('2018-03-01T00:00:00+00:00').getTime();
      transaction.signWith(account);

      assert.equal(
        base58.encode(transaction.toBinary()),
        'FXPf4kBRFURpiKRzWut1C8JhPsBDdQpoaUd43DvjaWfs5GFaovqSYGm1bNhdFKJXh1Rto6ZUojYvyKiekG5kQe3QbS1HXF9GXS7voTuzf3xt5K49tUf33gWD1TZDFAg4MBNEJpbWsqSrxQkHPaKF5x25KY6R26aqMmAdwQTXi',
      );
    });

    it('should return a binary tx V1', () => {
      transaction.version = 1;
      transaction.fee = 100000000; // old default fee
      transaction.timestamp = new Date('2018-03-01T00:00:00+00:00').getTime();
      transaction.signWith(account);

      assert.equal(
        base58.encode(transaction.toBinary()),
        'LfVAjhtHfNcJXUepVzXgegX6NehpnYva5gtA7RZypw36qSAj2Aqz4ZgUWZLeqsDYZSfJ8LsFJx7uQKvGvcr2q7KZNqdFqdvpHGs7dCigiu7ncYiGHUuD6TDarhLw5bCHAx4gTPSFWftBKB5yVRhwL6Lryj6xYP',
      );
    });
  });

  describe('#toJson', () => {
    it('should return a transaction to Json', () => {
      const expected = JSON.stringify({
        type: 16,
        version: 4,
        sender: '3N4mZ1qTrjWKnzBwAxscf7kfkoCs2HGQhJG',
        senderKeyType: 'ed25519',
        senderPublicKey: '2KduZAmAKuXEL463udjCQkVfwJkBQhpciUC4gNiayjSJ',
        fee: 100000000,
        timestamp: 1519862400000,
        associationType: 10,
        recipient: '3NACnKFVN2DeFYjspHKfa2kvDqnPkhjGCD2',
        subject: 'GKot5hBsd81kMupNCXHaqbhv3huEbxAFMLnpcX2hniwn',
        proofs: ['5YK9L6kdy43BUSP7bwaVAeiQw3J9K5gFcRQ3vR3YiTu6KYXSWH9R5BsvNw8t8N3KDuV6dUWLZbzLUJj5FXYkNX5G'],
      });
      transaction.fee = 100000000; // old default fee
      transaction.timestamp = new Date('2018-03-01T00:00:00+00:00').getTime();
      transaction.signWith(account);
      assert.equal(JSON.stringify(transaction), expected);
    });
  });

  describe('#from', () => {
    it('should return a transaction from the data v3', () => {
      const data = {
        type: 16,
        version: 3,
        sender: '3N5PoiMisnbNPseVXcCa5WDRLLHkj7dz4Du',
        senderKeyType: 'ed25519',
        senderPublicKey: 'AneNBwCMTG1YQ5ShPErzJZETTsHEWFnPWhdkKiHG6VTX',
        fee: 100000000,
        timestamp: 1640341125640,
        associationType: 10,
        recipient: '3NACnKFVN2DeFYjspHKfa2kvDqnPkhjGCD2',
        subject: 'GKot5hBsd81kMupNCXHaqbhv3huEbxAFMLnpcX2hniwn',
        proofs: ['4SYAJuygUmqFQtH6D5eN671Y1XT31yg1Es9pRxVz8QRHgtJQrLU8FiicUZYira959YHdLDRwYiZoSfd7FVKrPjwg'],
      };
      const actual = Association.from(data);
      assert.equal(JSON.stringify(actual), JSON.stringify(data));
    });

    it('should return a transaction from the data v4', () => {
      const data = {
        type: 16,
        version: 3,
        sender: '3N5PoiMisnbNPseVXcCa5WDRLLHkj7dz4Du',
        senderKeyType: 'ed25519',
        senderPublicKey: 'AneNBwCMTG1YQ5ShPErzJZETTsHEWFnPWhdkKiHG6VTX',
        fee: 100000000,
        timestamp: 1640341125640,
        associationType: 10,
        recipient: '3NACnKFVN2DeFYjspHKfa2kvDqnPkhjGCD2',
        expires: 1893456000000,
        subject: 'GKot5hBsd81kMupNCXHaqbhv3huEbxAFMLnpcX2hniwn',
        data: [
          { key: 'test', type: 'integer', value: 1 },
          { key: 'second', type: 'boolean', value: true },
          { key: 'third', type: 'binary', value: 'base64:Zm9v' },
          { key: 'fourth', type: 'string', value: 'hello' },
        ],
        proofs: ['4SYAJuygUmqFQtH6D5eN671Y1XT31yg1Es9pRxVz8QRHgtJQrLU8FiicUZYira959YHdLDRwYiZoSfd7FVKrPjwg'],
      };
      const actual = Association.from(data);
      assert.equal(JSON.stringify(actual), JSON.stringify(data));
    });
  });
});
