import { Account } from "../accounts/Account";
import { Transaction } from "src/transactions/Transaction";
import { Anchor } from "src/transactions/anchor";
import { PublicNode } from "src/PublicNode";
import { Association } from "src/transactions/association";

export class IdentityBuilder {

	public account: Account;
	public transactions: Transaction[];

	constructor(account: Account) {
		this.account = account;
		this.transactions = [];
	}

	public addVerificationMethod(secondaryAccount: Account, associationType: number, chainId: string = 'T') {
		let node = new PublicNode(chainId);
		const anchor = "oooooooooo"
		const anchorTx = new Anchor(anchor);
		anchorTx.signWith(secondaryAccount);
		anchorTx.sponsorWith(this.account);
		anchorTx.broadcastTo(node);

		const associationTx = new Association(secondaryAccount.address, associationType);
		associationTx.signWith(this.account);
		associationTx.broadcastTo(node);


		/*const transferTx = Transactions.transfer({
			amount: 35000000,
			recipient: secondaryAccount.address,
		}, this.account.seed);

		const anchorTx = Transactions.anchor({
			anchors: ["ooooooooooooooooooooo"],
			fee: 35000000,
		}, secondaryAccount.seed);

		const associationTx = Transactions.invokeAssociation({
			associationType,
			sender: this.account.address,
			party: secondaryAccount.address,
		}, this.account.seed);

		this.transactions.push(transferTx, anchorTx, associationTx);*/
	}
}
