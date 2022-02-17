# LTO API [![npm version](https://badge.fury.io/js/lto.svg)](https://badge.fury.io/js/lto-api)

Client for LTO Network. Integration for both public blockchain and private event-chain.

## Installation

```js
npm install lto-api --save
```


## Accounts

### Create an account
The chain_id is 'L' for the MainNet and 'T' TestNet

```python
const factory = require('@ltonetwork/lto').AccountFactoryED25519;

let account = new factory('T').create();
```
### Create an account from seed

```python
const factory = require('@ltonetwork/lto').AccountFactoryED25519;

let account = new factory('T').createFromSeed(seed);
```


### Create an account from private key

```python
const factory = require('@ltonetwork/lto').AccountFactoryED25519;

let account = new factory('T').createFromPrivateKey(privateKey);
```

## Executing Transactions:
First a transaction needs to be created:
### Ex Transfer Transaction
```
const transaction = require('@ltonetwork/lto').Transfer;
transaction = Transfer(recipient, amount);
```
The Transaction needs then to be signed. <br/>
In order to sign a transaction an account is needed (check at the beginning of the page the steps to create an account).

### Ex of signinig a transaction
```
transaction.signWith(account);
```
For last the transaction needs to be broadcasted to the node. <br/>
In order to do so we need to connect to the node using the PublicNode class.

```
const PublicNode = require('@ltonetwork/lto').publicNode;
const node = PublicNode(url);
```
The url refers to the node, there are many nodes available, here there are two examples, one for the MainNet and one for the TestNet <br/>

https://nodes.lto.network <br/>
https://testnet.lto.network

### Ex of broadcasting a transaction
```
transaction.broadcastTo(node);
```

## Transactions
### Transfer Transaction

```python
const transaction = require('@ltonetwork/lto').Transfer;

transaction = Transfer(recipient, amount)
```

### Mass Transfer Transaction

```python
const transaction = require('@ltonetwork/lto').MassTransfer

transaction = MassTransfer(transfers)
```
### Anchor Transaction

```python
const transaction = require('@ltonetwork/lto').Anchor;

transaction = Anchor(anchor)
```
### Lease Transaction

```python
const transaction = require('@ltonetwork/lto').Lease;

transaction = Lease(recipient, amount);
```
### Cancel Lease Transaction

```python
const transaction = require('@ltonetwork/lto').CancelLease;

transaction = CancelLease(lease_id);
```

### SetScript Transaction

```python
const transaction = require('@ltonetwork/lto').SetScript;

transaction = SetScript(script);
```

### Sponsorship transaction

```python
const transaction = require('@ltonetwork/lto').Sponsorship;

transaction = Sponsorship(recipient);
```

### Cancel Sponsorship transaction

```python
const transaction = require('@ltonetwork/lto').CancelSponsorship;

transaction = CancelSponsorship(recipient);
```

### Association transaction

```python
const transaction = require('@ltonetwork/lto').Association;

transaction = Association(recipient, association_type, anchor);
```
### Revoke Association transaction

```python
const transaction = require('@ltonetwork/lto').RevokeAssociation;

transaction = RevokeAssociation(recipient, association_type, anchor);

```

#### Seed Encryption

Your seed can be encrypted:

```js

const phrase = 'satisfy sustain shiver skill betray mother appear pupil coconut weasel firm top puzzle monkey seek';

const account = ew factory('T').createFromSeed(phrase);

const password = 'verysecretpassword';
const encrypted = account.encrypt(password); 
console.log(encrypted); //U2FsdGVkX18tLqNbaYdDu5V27VYD4iSylvKnBjMmvQoFFJO1KbsoKKW1eK/y6kqahvv4eak8Uf8tO1w2I9hbcWFUJDysZh1UyaZt6TmXwYfUZq163e9qRhPn4xC8VkxFCymdzYNBAZgyw8ziRhSujujiDZFT3PTmhhkBwIT7FMs=

```

or

```js
const phrase = 'satisfy sustain shiver skill betray mother appear pupil coconut weasel firm top puzzle monkey seek';

const password = 'verysecretpassword';
const encrypted = lto.encryptSeedPhrase(phrase, password);
console.log(encrypted); // U2FsdGVkX18tLqNbaYdDu5V27VYD4iSylvKnBjMmvQoFFJO1KbsoKKW1eK/y6kqahvv4eak8Uf8tO1w2I9hbcWFUJDysZh1UyaZt6TmXwYfUZq163e9qRhPn4xC8VkxFCymdzYNBAZgyw8ziRhSujujiDZFT3PTmhhkBwIT7FMs=
``` 

#### Decryption

To decrypt your seed:

```js
const encryptedSeed = 'U2FsdGVkX18tLqNbaYdDu5V27VYD4iSylvKnBjMmvQoFFJO1KbsoKKW1eK/y6kqahvv4eak8Uf8tO1w2I9hbcWFUJDysZh1UyaZt6TmXwYfUZq163e9qRhPn4xC8VkxFCymdzYNBAZgyw8ziRhSujujiDZFT3PTmhhkBwIT7FMs=';
const password = 'verysecretpassword';
const phrase = lto.decryptSeedPhrase(encryptedSeed);
console.log(phrase); // satisfy sustain shiver skill betray mother appear pupil coconut weasel firm top puzzle monkey seek
```

### EventChain

#### Create an event chain


```js
const chain = account.createEventChain(); // Creates an empty event chain with a valid id and last hash
```

#### Create and sign an event and add it to an existing event chain

```js
const EventChain = require('lto-api').EventChain;
const Event = require('lto-api').Event;

const body = {
  "$schema": "http://specs.livecontracts.io/01-draft/12-comment/schema.json#",
  "identity": {
    "$schema": "http://specs.livecontracts.io/01-draft/02-identity/schema.json#",
    "id": "1bb5a451-d496-42b9-97c3-e57404d2984f"
  },
  "content_media_type": "text/plain",
  "content": "Hello world!"
};

const chain = new EventChain('JEKNVnkbo3jqSHT8tfiAKK4tQTFK7jbx8t18wEEnygya');

chain.addEvent(new Event(body).signWith(account));
```

### HTTPSignature

#### Create a signature for an http request

```js
const headers = {
  date: (new Date("April 1, 2018 12:00:00")).toISOString()
};

const request = new Request('http://example.com', 'get', headers);

const httpSign = new HTTPSignature(request, ['(request-target)', 'date']);
const signatureHeader = httpSign.signWith(account); // keyId="FkU1XyfrCftc4pQKXCrrDyRLSnifX1SMvmx1CYiiyB3Y",algorithm="ed25519-sha256",headers="(request-target) date",signature="tMAxot4iWb8gB4FQ2zqIMfH2Fd8kA9DwSoW3UZPj9f8QlpLX5VvWf314vFnM8MsDo5kqtGzk7XOOy0TL4zVWAg=="
```

<!-- @todo: documentation for Identity class -->
