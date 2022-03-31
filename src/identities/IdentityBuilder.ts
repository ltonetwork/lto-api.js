import {Account} from "../accounts";
import {Anchor, Association, Register} from "../transactions";
import Transaction from "../transactions/Transaction";
import Binary from "../Binary";

export default class IdentityBuilder {
	public readonly account: Account;
	private newMethods: {account: Account, associationType: number}[] = [];

	constructor(account: Account) {
		this.account = account;
	}

	public addVerificationMethod(secondaryAccount: Account, associationType = 0x100): this {
		this.newMethods.push({account: secondaryAccount, associationType});
		return this;
	}

	public get transactions(): Transaction[] {
		if (this.newMethods.length === 0)
			return [
				new Anchor(
					Binary.fromHex("f491f5a9fa2d782566ff516a8a708e6a82db407428ec5d8f365c7cdf2fe6ef99")
				).signWith(this.account)
			];

		const txs: Transaction[] = [];

		const accounts = this.newMethods.map(method => method.account);
		txs.push(new Register(...accounts).signWith(this.account));

		this.newMethods.forEach(method => {
			txs.push(new Association(method.account.address, method.associationType).signWith(this.account));
		});

		return txs;
	}
}
