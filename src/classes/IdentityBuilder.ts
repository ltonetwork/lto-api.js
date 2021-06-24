import { Account } from './Account';

import * as Transactions from '@lto-network/lto-transactions';

export class IdentityBuilder {

    public account: Account;
    public transactions: Transactions.ITransaction[]

    constructor(account: Account) {
        this.account = account;
        this.transactions = [];
    }

    public addVerificationMethod(secondaryAccount: Account, associationType: number) {
        const transferTx = Transactions.transfer({
            amount: 35000000,
            recipient: secondaryAccount.address,
        }, this.account.seed);

        const anchorTx = Transactions.anchor({
            anchors: ['ooooooooooooooooooooo'],
            fee: 35000000,
        }, secondaryAccount.seed);

        const associationTx = Transactions.invokeAssociation({
            associationType,
            sender: this.account.address,
            party: secondaryAccount.address,
        }, this.account.seed);

        this.transactions.push(transferTx, anchorTx, associationTx);
    }
}
