import { Account } from '../accounts';
import { Anchor, Association, Data, Register, RevokeAssociation, Statement } from '../transactions';
import Transaction from '../transactions/Transaction';
import { IDIDService, TDIDRelationship } from '../../interfaces';
import { ASSOCIATION_TYPE_DID_VERIFICATION_METHOD, STATEMENT_TYPE_REVOKE_DID } from '../constants';

export default class IdentityBuilder {
  readonly account: Account;
  readonly newMethods: { account: Account; relationship: TDIDRelationship[]; expires?: Date }[] = [];
  readonly removedMethods: string[] = [];
  readonly newServices: IDIDService[] = [];
  readonly removedServices: string[] = [];

  constructor(account: Account) {
    this.account = account;
  }

  addVerificationMethod(
    secondaryAccount: Account,
    relationship?: TDIDRelationship | TDIDRelationship[],
    expires?: Date,
  ): this {
    relationship ??= [];
    if (typeof relationship === 'string') relationship = [relationship];

    this.newMethods.push({ account: secondaryAccount, relationship, expires });
    return this;
  }

  removeVerificationMethod(secondaryAccount: Account | string): this {
    const address =
      secondaryAccount instanceof Account ? secondaryAccount.address : secondaryAccount.replace(/^did:lto:|#.*$/g, '');

    this.removedMethods.push(address);
    return this;
  }

  addService(service: IDIDService): this {
    service.id ??=
      `${this.account.did}#` + service.type.replace(/([a-z])(?=[A-Z])|([A-Z])(?=[A-Z][a-z])/g, '$1$2-').toLowerCase();

    this.newServices.push(service);
    return this;
  }

  removeService(serviceId: string): this {
    this.removedServices.push(serviceId);
    return this;
  }

  get transactions(): Transaction[] {
    const txs = this.getMethodTxs();

    if (this.newServices.length > 0 || this.removedServices.length > 0) {
      txs.push(this.getServiceTx());
    }

    if (txs.length === 0) {
      txs.push(new Anchor().signWith(this.account));
    }

    return txs;
  }

  private getMethodTxs(): Transaction[] {
    const txs: Transaction[] = [];

    const accounts = this.newMethods.map((method) => method.account);
    if (accounts.length > 0) txs.push(new Register(...accounts).signWith(this.account));

    for (const method of this.newMethods) {
      const tx = new Association(
        ASSOCIATION_TYPE_DID_VERIFICATION_METHOD,
        method.account.address,
        undefined,
        method.expires,
        Object.fromEntries(method.relationship.map((rel) => [rel, true])),
      );
      txs.push(tx.signWith(this.account));
    }

    for (const address of this.removedMethods) {
      const tx = new RevokeAssociation(ASSOCIATION_TYPE_DID_VERIFICATION_METHOD, address);
      txs.push(tx.signWith(this.account));
    }

    return txs;
  }

  private getServiceTx(): Transaction {
    const entries = this.newServices.map((service) => {
      const key = service.id.startsWith(`${this.account.did}#`) ? service.id.replace(/^did:lto:\w+#/, '') : service.id;
      return [`did:service:${key}`, JSON.stringify(service)];
    });

    const removeEntries = this.removedServices.map((serviceId) => {
      const key = serviceId.startsWith(`${this.account.did}#`) ? serviceId.replace(/^did:lto:\w+#/, '') : serviceId;
      return [`did:service:${key}`, false]; // It's not possible to delete a data entry, so we set it to false
    });

    return new Data(Object.fromEntries([...entries, ...removeEntries])).signWith(this.account);
  }

  revokeDID(reason?: string): Statement {
    const data = reason ? { reason } : {};
    return new Statement(STATEMENT_TYPE_REVOKE_DID, undefined, undefined, data).signWith(this.account);
  }
}
