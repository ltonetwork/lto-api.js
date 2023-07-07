import { Account } from '../accounts';
import { Anchor, Association, Data, Register } from '../transactions';
import Transaction from '../transactions/Transaction';
import { VerificationRelationship } from './index';
import { IDIDService } from '../../interfaces';

type Relationship = 'authentication' | 'assertion' | 'keyAgreement' | 'capabilityInvocation' | 'capabilityDelegation';

export default class IdentityBuilder {
  readonly account: Account;
  readonly newMethods: { account: Account; associationType: number }[] = [];
  readonly newServices: IDIDService[] = [];

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

  addService(service: IDIDService): this {
    service.id ??= `${this.account.did}#${service.type}`;
    this.newServices.push(service);

    return this;
  }

  get transactions(): Transaction[] {
    if (this.newMethods.length === 0 && this.newServices.length === 0) {
      return [new Anchor().signWith(this.account)];
    }

    const txs = this.getMethodTxs();
    if (this.newServices.length > 0) txs.push(this.getServiceTx());

    return txs;
  }

  private getMethodTxs(): Transaction[] {
    if (this.newMethods.length === 0) return [];

    const txs: Transaction[] = [];

    const accounts = this.newMethods.map((method) => method.account);
    txs.push(new Register(...accounts).signWith(this.account));

    this.newMethods.forEach((method) => {
      txs.push(new Association(method.associationType, method.account.address).signWith(this.account));
    });

    return txs;
  }

  private getServiceTx(): Transaction {
    const entries = this.newServices.map((service) => {
      const key = service.id.startsWith(`${this.account.did}#`) ? service.id.replace(/^did:lto:\w+#/, '') : service.id;
      return [`did:service:${key}`, JSON.stringify(service)];
    });

    return new Data(Object.fromEntries(entries)).signWith(this.account);
  }
}
