import { Account } from './Account';

import * as Transactions from '@lto-network/lto-transactions';

type VerificationMethod = 'authentication' | 'assertionMethod' | 'keyAgreement' | 'capabilityInvocation' | 'capabilityDelegation';

export class IdentityBuilder {

    public account: Account;
    public transactions: Transactions.ITransaction[]

    constructor(account: Account) {
        this.account = account;
        this.transactions = [];
    }

    public addVerificationMethod(secondaryAccount: Account, verificationMethod: VerificationMethod) {
        const transferTx = Transactions.transfer({
            amount: 35000000,
            recipient: secondaryAccount.address,
        }, this.account.seed);

        const anchorTx = Transactions.anchor({
            anchors: ['oooooooooooooooooooooooooooooooooooooooooooo'],
        }, secondaryAccount.seed);

        const associationTx = Transactions.invokeAssociation({
            associationType: verificationMethod,
            sender: this.account.address,
            party: secondaryAccount.address,
        }, this.account.seed);

        this.transactions.push(transferTx, anchorTx, associationTx);
    }
}
