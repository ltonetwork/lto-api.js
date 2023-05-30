import { Account, AccountFactoryED25519, AccountFactoryECDSA, AccountFactory } from './accounts';
import { PublicNode } from './node';
import * as crypto from './utils/crypto';
import { SEED_ENCRYPTION_ROUNDS, DEFAULT_MAINNET_NODE, DEFAULT_TESTNET_NODE } from './constants';
import { IAccountIn, IPair, IHash, ITransfer, ISigner, IPublicAccount } from '../interfaces';
import {
  Anchor,
  Association,
  Burn,
  CancelLease,
  CancelSponsorship,
  Data,
  Lease,
  MappedAnchor,
  MassTransfer, Register,
  RevokeAssociation,
  Sponsorship,
  Statement,
  Transfer,
} from './transactions';
import Binary from './Binary';
import { decryptSeed } from './utils/encrypt-seed';

export default class LTO {
  public readonly networkId: string;
  private _nodeAddress?: string;
  private _node?: PublicNode;
  public accountFactories: { [_: string]: AccountFactory };

  constructor(networkId = 'L') {
    this.networkId = networkId;

    switch (this.networkId) {
      case 'L':
        this.nodeAddress = DEFAULT_MAINNET_NODE;
        break;
      case 'T':
        this.nodeAddress = DEFAULT_TESTNET_NODE;
        break;
    }

    this.accountFactories = {
      ed25519: new AccountFactoryED25519(this.networkId),
      secp256r1: new AccountFactoryECDSA(this.networkId, 'secp256r1'),
      secp256k1: new AccountFactoryECDSA(this.networkId, 'secp256k1'),
    };
  }

  public set nodeAddress(url: string) {
    this._nodeAddress = url;
    this._node = new PublicNode(url);
  }

  public get nodeAddress(): string {
    if (!this._nodeAddress) throw Error('Public node not configured');
    return this._nodeAddress;
  }

  public set node(node: PublicNode) {
    this._node = node;
    this._nodeAddress = node.url;
  }

  public get node(): PublicNode {
    if (!this._node) throw Error('Public node not configured');
    return this._node;
  }

  private static guardAccount(
    account: Account,
    address?: string,
    publicKey?: string | Uint8Array,
    privateKey?: string | Uint8Array,
  ): Account {
    if (privateKey instanceof Uint8Array) privateKey = Binary.from(publicKey).base58;
    if (publicKey instanceof Uint8Array) publicKey = Binary.from(publicKey).base58;

    if (privateKey && account.privateKey !== privateKey) throw Error('Private key mismatch');
    if (publicKey && account.publicKey !== publicKey) throw Error('Public key mismatch');
    if (address && account.address !== address) throw Error('Address mismatch');

    return account;
  }

  /**
   * Create an account.
   */
  public account(settings: IAccountIn = {}): Account {
    let account: Account;

    const keyType = settings.keyType ?? settings.parent?.keyType ?? 'ed25519';
    const factory = this.accountFactories[keyType];
    if (!factory) throw Error(`Invalid key type: ${keyType}`);

    if (settings.derivationPath) settings.nonce = new Binary(settings.derivationPath);

    if (settings.seed) {
      const seed = settings.seedPassword
        ? decryptSeed(settings.seed, settings.seedPassword, SEED_ENCRYPTION_ROUNDS)
        : settings.seed;
      account = factory.createFromSeed(seed, settings.nonce);
    } else if (settings.parent) {
      account = factory.createFromSeed(settings.parent.seed, settings.nonce);
    } else if (settings.privateKey) {
      account = factory.createFromPrivateKey(settings.privateKey);
    } else if (settings.publicKey) {
      account = factory.createFromPublicKey(settings.publicKey);
    } else {
      account = factory.create();
    }

    if (settings.parent) {
      account.parent =
        settings.parent instanceof Account
          ? settings.parent
          : this.account({ keyType: settings.keyType, ...settings.parent });
    }

    return LTO.guardAccount(account, settings.address, settings.publicKey, settings.privateKey);
  }

  /**
   * Check if the address is valid for the current network.
   */
  public isValidAddress(address: string): boolean {
    return crypto.isValidAddress(address, this.networkId);
  }

  /**
   * Transfer LTO from account to recipient.
   * Amount is number of LTO * 10^8.
   */
  public transfer(
    sender: Account,
    recipient: string | Account,
    amount: number,
    attachment: Uint8Array | string = '',
  ): Promise<Transfer> {
    return new Transfer(recipient, amount, attachment).signWith(sender).broadcastTo(this.node);
  }

  /**
   * Transfer LTO from one account to up to 100 recipients.
   */
  public massTransfer(
    sender: Account,
    transfers: ITransfer[],
    attachment: Uint8Array | string = '',
  ): Promise<MassTransfer> {
    return new MassTransfer(transfers, attachment).signWith(sender).broadcastTo(this.node);
  }

  /**
   * Burn LTO from account. *poof* it's gone.
   * Amount is number of LTO * 10^8.
   */
  public burn(sender: Account, amount: number): Promise<Burn> {
    return new Burn(amount).signWith(sender).broadcastTo(this.node);
  }

  /**
   * Write one or more hashes to the blockchain.
   */
  public anchor(sender: Account, ...anchors: Uint8Array[]): Promise<Anchor>;
  public anchor(sender: Account, ...anchors: IPair<Uint8Array>[]): Promise<MappedAnchor>;
  public anchor(sender: Account, ...anchors: Uint8Array[] | IPair<Uint8Array>[]): Promise<Anchor | MappedAnchor> {
    if (anchors.length === 0) throw new Error('No anchors provided');

    return anchors[0] instanceof Uint8Array
      ? new Anchor(...(anchors as Uint8Array[])).signWith(sender).broadcastTo(this.node)
      : new MappedAnchor(...(anchors as IPair<Uint8Array>[])).signWith(sender).broadcastTo(this.node);
  }

  /**
   * Write one or more hashes as key/value pair to the blockchain.
   * @deprecated use `anchor` instead
   */
  public mappedAnchor(sender: Account, ...anchors: IPair<Uint8Array>[]): Promise<MappedAnchor> {
    return new MappedAnchor(...anchors).signWith(sender).broadcastTo(this.node);
  }

  /**
   * Register public keys on the blockchain.
   */
  public register(sender: Account, ...accounts: Array<IPublicAccount | ISigner>): Promise<Register> {
    return new Register(...accounts).signWith(sender).broadcastTo(this.node);
  }

  /**
   * Issue an association between accounts.
   */
  public associate(
    sender: Account,
    type: number,
    recipient: string | Account,
    subject?: Uint8Array,
    expires?: Date | number,
    data?: IHash<number | boolean | string | Uint8Array>,
  ): Promise<Association> {
    return new Association(type, recipient, subject, expires, data ?? []).signWith(sender).broadcastTo(this.node);
  }

  /**
   * Revoke an association between accounts.
   */
  public revokeAssociation(
    sender: Account,
    type: number,
    recipient: string | Account,
    subject?: Uint8Array,
  ): Promise<RevokeAssociation> {
    return new RevokeAssociation(type, recipient, subject).signWith(sender).broadcastTo(this.node);
  }

  /**
   * Make a public statement on the blockchain.
   */
  public makeStatement(
    sender: Account,
    type: number,
    recipient?: string | Account,
    subject?: Uint8Array,
    data?: IHash<number | boolean | string | Uint8Array>,
  ): Promise<Statement> {
    return new Statement(type, recipient, subject, data ?? []).signWith(sender).broadcastTo(this.node);
  }

  /**
   * Lease an amount to a public node for staking.
   */
  public lease(sender: Account, recipient: string | Account, amount: number): Promise<Lease> {
    return new Lease(recipient, amount).signWith(sender).broadcastTo(this.node);
  }

  /**
   * Cancel a staking lease.
   */
  public cancelLease(sender: Account, leaseId: string): Promise<CancelLease> {
    return new CancelLease(leaseId).signWith(sender).broadcastTo(this.node);
  }

  /**
   * Sponsor an account.
   */
  public sponsor(sender: Account, recipient: string | Account): Promise<Sponsorship> {
    return new Sponsorship(recipient).signWith(sender).broadcastTo(this.node);
  }

  /**
   * Stop sponsoring an account.
   */
  public cancelSponsorship(sender: Account, recipient: string | Account): Promise<CancelSponsorship> {
    return new CancelSponsorship(recipient).signWith(sender).broadcastTo(this.node);
  }

  /**
   * Get the current account balance.
   */
  public async getBalance(account: Account | string): Promise<number> {
    const address = account instanceof Account ? account.address : account;
    return (await this.node.get(`/addresses/balance/${address}`)).balance;
  }

  /**
   * Set account data.
   */
  public setData(account: Account, data: IHash<number | boolean | string | Uint8Array>) {
    return new Data(data).signWith(account).broadcastTo(this.node);
  }

  /**
   * Get account data.
   */
  public async getData(account: Account | string): Promise<IHash<number | boolean | string | Binary>> {
    const address = account instanceof Account ? account.address : account;
    const dataEntries = await this.node.get(`/addresses/data/${address}`);
    return Data.from({ type: Data.TYPE, data: dataEntries }).dict;
  }
}
