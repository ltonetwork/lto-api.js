# LTO API [![npm version](https://badge.fury.io/js/lto.svg)](https://badge.fury.io/js/lto-api)

Client for LTO Network. Integration for both public blockchain and private event-chain.

## Installation

```js
npm install lto-api --save
```

## Using the library

The chain_id is 'L' for the mainnet and 'T' testnet.


```js
import LTO from '@ltonetwork/lto';
const lto = new LTO('T');
```

Or using require.

```js
const LTO = require('@ltonetwork/lto').LTO;
const lto = new LTO('T');
```

## Accounts

### Create an account

```js
cont account = lto.account();
```

### Create an account from seed

```js
const seed = 'satisfy sustain shiver skill betray mother appear pupil coconut weasel firm top puzzle monkey seek';
const account = lto.account({seed: seed});
```

#### Encryption

Your seed can be encrypted:

```js

const seed = 'satisfy sustain shiver skill betray mother appear pupil coconut weasel firm top puzzle monkey seek';
const account = lto.account({seed: seed});

const password = 'verysecretpassword';
const encrypted = account.encrypt(password); 
console.log(encrypted); //U2FsdGVkX18tLqNbaYdDu5V27VYD4iSylvKnBjMmvQoFFJO1KbsoKKW1eK/y6kqahvv4eak8Uf8tO1w2I9hbcWFUJDysZh1UyaZt6TmXwYfUZq163e9qRhPn4xC8VkxFCymdzYNBAZgyw8ziRhSujujiDZFT3PTmhhkBwIT7FMs=
```

#### Decryption

To create an account from an encrypted seed add `seedPassword` when creating the account from seed.

```js
const encryptedSeed = 'U2FsdGVkX18tLqNbaYdDu5V27VYD4iSylvKnBjMmvQoFFJO1KbsoKKW1eK/y6kqahvv4eak8Uf8tO1w2I9hbcWFUJDysZh1UyaZt6TmXwYfUZq163e9qRhPn4xC8VkxFCymdzYNBAZgyw8ziRhSujujiDZFT3PTmhhkBwIT7FMs=';
const password = 'verysecretpassword';
const account = lto.account({seed: encryptedSeed, seedPassword: password});
```

## Basic usage

```js
import sha256 from '@ltonetwork/lto/crypto';

lto.transfer(account, recipient, 100 * 10^8);
lto.massTransfer(account, [{recipient: recipient1, amount: 100 * 10^8}, {recipient: recipient2: amount: 50 * 10^8}]);
lto.anchor(account, sha256('some value'), sha256('other value'));
lto.issueAssociation(account, recipient, 10);
lto.revokeAssociation(account, recipient, 10);
lto.lease(account, recipient, 10000 * 10^8);
lto.cancelLease(account, leaseId);
lto.sponsor(account, otherAccount);
lto.cancelSponsorship(account, otherAccount);

lto.getBalance(account);
lto.setData(account, {foo: 'bar'});
lto.getData(account);
```

_Amounts are in `LTO * 10^8`. Eg: 12.46 LTO is `1246000000`._

## Executing Transactions

The `LTO` class provides a simple way for doing transactions. Some features like multisig and sponsored transactions
aren't available with these methods. To use them you'll need to create a transaction object, sign and broadcast it.

### Create transaction

```js
import Transfer from '@ltonetwork/lto/transactions';

const transaction = new Transfer(recipient, amount);
```

### Sign transaction

The Transaction needs then to be signed. In order to sign a transaction an account is needed.

```js
account.sign(transaction);
```

### Broadcasting transaction

For last the transaction needs to be broadcasted to the node.
In order to do so we need to connect to the node using the PublicNode class.

```js
const broadcastedTx = await lto.publicNode.broadcast(transaction);
```

### Fluent interface

Transaction objects have convenience providing a fluent interface

```js
import Transfer from '@ltonetwork/lto/transactions';

const transaction = await new Transfer(recipient, amount)
    .signWith(account)
    .broadcastTo(lto.publicNode);
```


## Transactions

### Transfer Transaction

```js
import {Transfer} from '@ltonetwork/lto/transactions';

const transaction = new Transfer(recipient, amount)
```

### Mass Transfer Transaction

```js
import {MassTransfer} from '@ltonetwork/lto/transactions';

const transaction = new MassTransfer({recipient: recipient1, amount: amount1}, {recipient: recipient2, amount: amount2})
```

### Anchor Transaction

```js
import {Anchor} from '@ltonetwork/lto/transactions';

const transaction = new Anchor(hash)
```
### Lease Transaction

```js
import {Lease} from '@ltonetwork/lto/transactions';

const transaction = new Lease(recipient, amount);
```
### Cancel Lease Transaction

```js
import {CancelLease} from '@ltonetwork/lto/transactions';

const transaction = new CancelLease(leaseId);
```

### SetScript Transaction

```js
import {SetScript} from '@ltonetwork/lto/transactions';

const transaction = new SetScript(script);
```

### Sponsorship transaction

```js
import {SetScript} from '@ltonetwork/lto/transactions';

const transaction = new Sponsorship(recipient);
```

### Cancel Sponsorship transaction

```js
import {CancelSponsorship} from '@ltonetwork/lto/transactions';

const transaction = new CancelSponsorship(recipient);
```

### Association transaction

```js
import {Association} from '@ltonetwork/lto/transactions';

transaction = new Association(recipient, association_type, hash);
```
### Revoke Association transaction

```js
import {RevokeAssociation} from '@ltonetwork/lto/transactions';

transaction = new RevokeAssociation(recipient, association_type, hash);

```

## Public Node

By default the following public nodes are used

* **Mainnet** - https://nodes.lto.network
* **Testnet** - https://testnet.lto.network

To use your own public node, set the node address of the `LTO` object.

```
lto.nodeAddress = "http://localhost:6869";
```

The `lto.publicNode` object will automatically be replaced when the node address is changed.

## EventChain

### Create an event chain


```js
const chain = account.createEventChain(); // Creates an empty event chain with a valid id and last hash
```

### Create and sign an event and add it to an existing event chain

```js
import {Event, EventChain} from '@ltonetwork/lto/events';

const body = {
  "$schema": "http://specs.livecontracts.io/01-draft/12-comment/schema.json#",
  "identity": {
    "$schema": "http://specs.livecontracts.io/01-draft/02-identity/schema.json#",
    "id": "1bb5a451-d496-42b9-97c3-e57404d2984f"
  },
  "content_media_type": "text/plain",
  "content": "Hello world!"
};

const chain = new EventChain(account);
const genesisEvent = new Event(body).signWith(account);

chain.addEvent(genesisEvent);
```

## HTTPSignature

HTTP requests can be signed with an LTO account using [http-signatures standard](https://datatracker.ietf.org/doc/html/draft-cavage-http-signatures-12).

### Client side

```js
import {Request, HTTPSignature} from '@ltonetwork/lto/http';

const headers = {
  date: (new Date("April 1, 2018 12:00:00")).toISOString()
};

const request = new Request('http://example.com', 'get', headers);

const httpSign = new HTTPSignature(request, ['(request-target)', 'date']);
const signatureHeader = httpSign.signWith(account); // keyId="FkU1XyfrCftc4pQKXCrrDyRLSnifX1SMvmx1CYiiyB3Y",algorithm="ed25519-sha256",headers="(request-target) date",signature="tMAxot4iWb8gB4FQ2zqIMfH2Fd8kA9DwSoW3UZPj9f8QlpLX5VvWf314vFnM8MsDo5kqtGzk7XOOy0TL4zVWAg=="
```

The `signatureHeader` should added as 'Signature' HTTP Header to an API request.

### Server side

On the server the request should be validated. This should typically be done through middleware.

```js
import {Request, HTTPSignature} from '@ltonetwork/lto/http';

app.use((req, res, next) => {
    const request = new Request(req.path, req.method, req.headers);
    const httpSign = new HTTPSignature(request, ['(request-target)', 'date']).verify();
    
    try {
        httpSign.verify();
    } catch (error) {
        res.send(error);
    }
    
    next();
});
```

## Identity builder

Any account on LTO network, for which the public key is known, can be resolved as DID (decentralized identifier). To
explicitly create a DID use the identity builder.

```js
import {IdentityBuilder} from '@ltonetwork/lto/identity';

const account = lto.account();

new IdentityBuilder(account).transactions.map(tx => lto.broadcast(tx));
```

### Verification methods

By default the account's public key is the only verification method of the DID. Other verification methods can be added
through associations with other accounts.

```js
import {IdentityBuilder, VerificationRelationship as VR} from '@ltonetwork/lto/identity';

const account = lto.account();
const key1 = lto.account({publicKey: "8cMyCW5Esx98zBqQCy9N36UaGZuNcuJhVe17DuG42dHS"});
const key2 = lto.account({publicKey: "9ubzzV9tRYTcQee68v1mUPJW7PHdB74LZEgG1MgZUExf"});

new IdentityBuilder(account)
  .addVerificationMethod(key1)
  .addVerificationMethod(key2, VR.authentication | VR.capabilityInvocation)
  .transactions.map(tx => lto.broadcast(tx));
```

_Use `Promise.all()` if you wait to await for the transactions to be broadcasted._

