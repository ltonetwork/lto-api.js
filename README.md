# LTO API [![npm version](https://badge.fury.io/js/lto-api.svg)](https://badge.fury.io/js/lto-api)

LegalThings One Platform core features.

## Installation

```js
npm install lto-api --save
```

## Usage

```js
const LTO = require('lto-api');
const lto = new LTO();
```

### Seed

#### Creation
You can create a new random seed with keypair (ed25519):

```js
const seed = lto.createSeed();
console.log(seed.phrase); // 'satisfy sustain shiver skill betray mother appear pupil coconut weasel firm top puzzle monkey seek'
console.log(seed.keyPair); // { privateKey: '4hPpf5Lbf5zTszcGLgHWwHdMgMAPAyteFQZt8cYCRqg4KC4byPYXRBzETvxECYGjrewzrUG1eKrfFdZAB3RZRvFw', publicKey: 'GuCK3Vaemyc3fUH94WUZ8tdQUZuG6YQmQBh93mu8E67F' }

```


#### Recovery 

It's also possible to recover a keypair from an existing seed:

```js
const phrase = 'satisfy sustain shiver skill betray mother appear pupil coconut weasel firm top puzzle monkey seek';

const seed = lto.seedFromExistingPhrase(phrase);
console.log(seed.phrase); // 'satisfy sustain shiver skill betray mother appear pupil coconut weasel firm top puzzle monkey seek'
console.log(seed.keyPair); // { privateKey: '4hPpf5Lbf5zTszcGLgHWwHdMgMAPAyteFQZt8cYCRqg4KC4byPYXRBzETvxECYGjrewzrUG1eKrfFdZAB3RZRvFw', publicKey: 'GuCK3Vaemyc3fUH94WUZ8tdQUZuG6YQmQBh93mu8E67F' }

```

#### Encryption

Your seed can be encrypted:

```js

const phrase = 'satisfy sustain shiver skill betray mother appear pupil coconut weasel firm top puzzle monkey seek';

const seed = lto.seedFromExistingPhrase(phrase);

const password = 'verysecretpassword';
const encrypted = seed.encrypt(password); 
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

### Signing

You can use your private key to sign an event

```js
const seed = lto.createSeed();

const event = {
    body: 'somebody',
    timestamp: 1520000000,
    previous: 'fake_hash',
    signkey: seed.keyPair.publicKey
};

const signature = lto.signEvent(event, seed.keyPair.privateKey);
console.log(signature); // RVxWjySPSgrvLJrAkaszbQHh5wmy89Uf9HKNeNCumQaiANiBtmDhZuj9WjSQPzJDVhGyyvvM1myCqdeuxQKQWct
```