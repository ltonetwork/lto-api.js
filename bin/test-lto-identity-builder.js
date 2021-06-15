// @todo: create a script to send the identity transactions to testnet
// (https://testnet.lto.network/api-docs/index.html#!/transactions/broadcast)

const path = require('path');

const LTO = require(path.join(__dirname, '..', 'dist', 'lto-api'));

const Account = LTO.Account;
const IdentityBuilder = LTO.IdentityBuilder;

const senderSeed = 'element hello pluck double cheese load genre put parade tip swing crack slam erosion rich';
const recipientSeed = 'manage manual recall harvest series desert melt police rose hollow moral pledge kitten position add';

const sender = new Account(senderSeed);
const recipient = new Account(recipientSeed);

const identity = new IdentityBuilder(sender);

identity.addVerificationMethod(recipient, 'assertionMethod');
identity.addVerificationMethod(recipient, 'authentication');

// @todo: send the transactions to testnet

console.log('sender.address', sender.address);
console.log('recipient.address', recipient.address);
console.log('identity.transactions', identity.transactions);