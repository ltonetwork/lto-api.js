import { base58 } from '@scure/base';
import { PublicNode } from '../node/';
import { ISigner, ITxJSON, TKeyType } from '../types';
import { getNetwork } from '../utils';

export default abstract class Transaction {
  id?: string;
  readonly type: number;
  version: number;
  fee: number;
  timestamp?: number;
  proofs: Array<string> = [];
  sender?: string;
  senderKeyType: TKeyType = 'ed25519';
  senderPublicKey?: string;
  sponsor?: string;
  sponsorKeyType?: string;
  sponsorPublicKey?: string;
  height?: number;

  protected constructor(type: number, version: number, fee = 0) {
    this.type = type;
    this.version = version;
    this.fee = fee;
  }

  abstract toBinary(): Uint8Array;

  abstract toJSON(): ITxJSON;

  isSigned(): boolean {
    return this.proofs.length != 0;
  }

  signWith(account: ISigner): this {
    if (!this.timestamp) this.timestamp = Date.now();

    if (!this.sender) {
      this.sender = account.address;
      this.senderKeyType = account.keyType;
      this.senderPublicKey = account.publicKey;
    }

    const signature = account.sign(this.toBinary()).base58;

    if (!this.proofs.includes(signature)) this.proofs.push(signature);

    if (typeof (account as any).parent !== 'undefined' && !this.sponsor) {
      this.sponsorWith((account as any).parent);
    }

    return this;
  }

  get networkId(): string {
    if (!this.sender) throw new Error('Network id unknown');
    return getNetwork(this.sender);
  }

  broadcastTo(node: PublicNode): Promise<this> {
    if (this.isSigned()) {
      return node.broadcast(this);
    }

    if (node.apiKey === '') throw new Error('Node API key required to broadcast unsigned transactions');
    return node.submit(this);
  }

  sponsorWith(sponsorAccount: ISigner): this {
    if (!this.isSigned()) throw new Error('Transaction must be signed first');

    if (this.sponsor) this.proofs.pop(); // The sponsor is replaced. The last proof is from the old sponsor.

    const signature = sponsorAccount.sign(this.toBinary());

    this.sponsor = sponsorAccount.address;
    this.sponsorPublicKey = sponsorAccount.publicKey;
    this.sponsorKeyType = sponsorAccount.keyType;
    this.proofs.push(base58.encode(signature));

    return this;
  }

  protected initFrom(data: ITxJSON): this {
    this.version = data.version;
    this.id = data.id;
    this.timestamp = data.timestamp;
    this.fee = data.fee;
    this.sender = data.sender;
    this.senderKeyType = data.senderKeyType ?? 'ed25519';
    this.senderPublicKey = data.senderPublicKey;

    if (data.sponsor) {
      this.sponsor = data.sponsor;
      this.sponsorKeyType = data.sponsorKeyType ?? 'ed25519';
      this.sponsorPublicKey = data.sponsorPublicKey;
    }

    this.proofs = data.proofs ?? [];
    this.height = data.height;

    return this;
  }
}
