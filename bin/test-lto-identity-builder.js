// @todo: create a script to send the identity transactions to testnet
// (https://testnet.lto.network/api-docs/index.html#!/transactions/broadcast)

const path = require('path');

// @todo: this doesn't work, need the built JS instead of raw TS
// const Account = require(path.join(__dirname, '..', 'src', 'classes', 'Account')).Account;
// const IdentityBuilder = require(path.join(__dirname, '..', 'src', 'classes', 'IdentityBuilder')).IdentityBuilder;

// @todo: create identity
const senderSeed = 'element hello pluck double cheese load genre put parade tip swing crack slam erosion rich';
const recipientSeed = 'manage manual recall harvest series desert melt police rose hollow moral pledge kitten position add';

const sender = new Account(senderSeed);
const recipient = new Account(recipientSeed);

const identity = new IdentityBuilder(sender);

identity.addVerificationMethod(recipient, 'assertionMethod');
identity.addVerificationMethod(recipient, 'authentication');

console.log('sender.address', sender.address);
console.log('recipient.address', recipient.address);
console.log('identity.transactions', identity.transactions);