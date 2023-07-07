import { Account } from '../accounts';
import { Anchor, Association, Register } from '../transactions';
import Transaction from '../transactions/Transaction';
import Binary from '../Binary';
import { VerificationRelationship } from './index';

type Relationship = 'authentication' | 'assertion' | 'keyAgreement' | 'capabilityInvocation' | 'capabilityDelegation';

export default class IdentityBuilder {
  readonly account: Account;
  readonly newMethods: { account: Account; associationType: number }[] = [];

  constructor(account: Account) {
    this.account = account;
  }

  private relationshipToAssociationType(relationship: Relationship | Relationship[]): number {
    return Array.isArray(relationship)
      ? relationship.reduce((acc, rel) => acc | VerificationRelationship[rel], 0)
      : VerificationRelationship[relationship];
  }

  addVerificationMethod(secondaryAccount: Account, relationship: number | Relationship | Relationship[] = 0x100): this {
    const associationType =
      typeof relationship === 'number' ? relationship : this.relationshipToAssociationType(relationship);

    this.newMethods.push({ account: secondaryAccount, associationType });
    return this;
  }

  get transactions(): Transaction[] {
    if (this.newMethods.length === 0)
      return [
        new Anchor(Binary.fromHex('f491f5a9fa2d782566ff516a8a708e6a82db407428ec5d8f365c7cdf2fe6ef99')).signWith(
          this.account,
        ),
      ];

    const txs: Transaction[] = [];

    const accounts = this.newMethods.map((method) => method.account);
    txs.push(new Register(...accounts).signWith(this.account));

    this.newMethods.forEach((method) => {
      txs.push(new Association(method.associationType, method.account.address).signWith(this.account));
    });

    return txs;
  }
}
