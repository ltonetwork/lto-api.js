import { Account, AccountFactoryED25519, AccountFactoryECDSA, AccountFactory } from './accounts';
import { PublicNode } from './node';
import { isValidAddress } from './utils';
import { DEFAULT_MAINNET_NODE, DEFAULT_TESTNET_NODE, DEFAULT_RELAY_SERVICE } from './constants';
import { IAccountIn, IPair, ITransfer, ISigner, IPublicAccount } from './types';
import {
  Anchor,
  Association,
  Burn,
  CancelLease,
  CancelSponsorship,
  Data,
  Lease,
  MappedAnchor,
  MassTransfer,
  Register,
  RevokeAssociation,
  Sponsorship,
  Statement,
  Transfer,
} from './transactions';
import Binary from './Binary';
import { decryptSeed } from './utils';
import { AccountResolver } from './identities';
import { Relay } from './messages';

export default class LTO {
  readonly networkId: string;
  private _nodeAddress?: string;
  private _node?: PublicNode;
  accountResolver?: AccountResolver;
  relay?: Relay;
  accountFactories: { [_: string]: AccountFactory };

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

    this.relay = new Relay(DEFAULT_RELAY_SERVICE);

    this.accountFactories = {
      ed25519: new AccountFactoryED25519(this.networkId),
      secp256r1: new AccountFactoryECDSA(this.networkId, 'secp256r1'),
      secp256k1: new AccountFactoryECDSA(this.networkId, 'secp256k1'),
    };
  }

  set nodeAddress(url: string) {
    this._nodeAddress = url;
    this._node = new PublicNode(url);

    this.createAccountResolver();
  }

  get nodeAddress(): string {
    if (!this._nodeAddress) throw Error('Public node not configured');
    return this._nodeAddress;
  }

  set node(node: PublicNode) {
    this._node = node;
    this._nodeAddress = node.url;

    this.createAccountResolver();
  }

  get node(): PublicNode {
    if (!this._node) throw Error('Public node not configured');
    return this._node;
  }

  private createAccountResolver() {
    this.accountResolver = new AccountResolver(
      this.networkId,
      `${this.nodeAddress}/index/identifiers`,
      this.accountFactories,
    );
  }

  private static guardAccount(
    account: Account,
    address?: string,
    publicKey?: string | Uint8Array,
    privateKey?: string | Uint8Array,
  ): Account {
    if (privateKey instanceof Uint8Array) privateKey = Binary.from(privateKey).base58;
    if (publicKey instanceof Uint8Array) publicKey = Binary.from(publicKey).base58;

    if (privateKey && account.privateKey !== privateKey) throw Error('Private key mismatch');
    if (publicKey && account.publicKey !== publicKey) throw Error('Public key mismatch');
    if (address && account.address !== address) throw Error('Address mismatch');

    return account;
  }

  /**
   * Create an account.
   */
  account(settings: IAccountIn = {}): Account {
    let account: Account;

    const keyType = settings.keyType ?? settings.parent?.keyType ?? 'ed25519';
    const factory = this.accountFactories[keyType.toLowerCase()];
    if (!factory) throw Error(`Invalid key type: ${keyType}`);

    if (settings.derivationPath) settings.nonce = new Binary(settings.derivationPath);
    if (typeof settings.nonce === 'string') {
      if (!settings.nonce.startsWith('base64:')) {
        throw Error('Invalid nonce: must be a number, binary value, or base64 string prefixed with "base64:"');
      }
      settings.nonce = Binary.fromBase64(settings.nonce.slice(7));
    }

    if (settings.seed) {
      const seed = settings.seedPassword ? decryptSeed(settings.seed, settings.seedPassword) : settings.seed;
      account = factory.createFromSeed(seed, settings.nonce);
    } else if (settings.parent || settings.derivationPath) {
      account = factory.createFromSeed(settings.parent?.seed ?? '', settings.nonce);
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
  isValidAddress(address: string): boolean {
    return isValidAddress(address, this.networkId);
  }

  /**
   * Use DID resolver to resolve an address into a public key account.
   */
  async resolveAccount(address: string): Promise<Account> {
    return this.accountResolver.resolve(address);
  }

  /**
   * Transfer LTO from account to recipient.
   * Amount is number of LTO * 10^8.
   */
  transfer(
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
  massTransfer(sender: Account, transfers: ITransfer[], attachment: Uint8Array | string = ''): Promise<MassTransfer> {
    return new MassTransfer(transfers, attachment).signWith(sender).broadcastTo(this.node);
  }

  /**
   * Burn LTO from account. *poof* it's gone.
   * Amount is number of LTO * 10^8.
   */
  burn(sender: Account, amount: number): Promise<Burn> {
    return new Burn(amount).signWith(sender).broadcastTo(this.node);
  }

  /**
   * Write one or more hashes to the blockchain.
   */
  anchor(sender: Account, ...anchors: Uint8Array[]): Promise<Anchor>;
  anchor(sender: Account, ...anchors: IPair<Uint8Array>[]): Promise<MappedAnchor>;
  anchor(sender: Account, ...anchors: Uint8Array[] | IPair<Uint8Array>[]): Promise<Anchor | MappedAnchor> {
    if (anchors.length === 0) throw new Error('No anchors provided');

    return anchors[0] instanceof Uint8Array
      ? new Anchor(...(anchors as Uint8Array[])).signWith(sender).broadcastTo(this.node)
      : new MappedAnchor(...(anchors as IPair<Uint8Array>[])).signWith(sender).broadcastTo(this.node);
  }

  /**
   * Register public keys on the blockchain.
   */
  register(sender: Account, ...accounts: Array<IPublicAccount | ISigner>): Promise<Register> {
    return new Register(...accounts).signWith(sender).broadcastTo(this.node);
  }

  /**
   * Issue an association between accounts.
   */
  associate(
    sender: Account,
    type: number,
    recipient: string | Account,
    subject?: Uint8Array,
    expires?: Date | number,
    data?: Record<string, number | boolean | string | Uint8Array>,
  ): Promise<Association> {
    return new Association(type, recipient, subject, expires, data ?? []).signWith(sender).broadcastTo(this.node);
  }

  /**
   * Revoke an association between accounts.
   */
  revokeAssociation(
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
  makeStatement(
    sender: Account,
    type: number,
    recipient?: string | Account,
    subject?: Uint8Array,
    data?: Record<string, number | boolean | string | Uint8Array>,
  ): Promise<Statement> {
    return new Statement(type, recipient, subject, data ?? []).signWith(sender).broadcastTo(this.node);
  }

  /**
   * Lease an amount to a public node for staking.
   */
  lease(sender: Account, recipient: string | Account, amount: number): Promise<Lease> {
    return new Lease(recipient, amount).signWith(sender).broadcastTo(this.node);
  }

  /**
   * Cancel a staking lease.
   */
  cancelLease(sender: Account, leaseId: string): Promise<CancelLease> {
    return new CancelLease(leaseId).signWith(sender).broadcastTo(this.node);
  }

  /**
   * Sponsor an account.
   */
  sponsor(sender: Account, recipient: string | Account): Promise<Sponsorship> {
    return new Sponsorship(recipient).signWith(sender).broadcastTo(this.node);
  }

  /**
   * Stop sponsoring an account.
   */
  cancelSponsorship(sender: Account, recipient: string | Account): Promise<CancelSponsorship> {
    return new CancelSponsorship(recipient).signWith(sender).broadcastTo(this.node);
  }

  /**
   * Get the current account balance.
   */
  async getBalance(account: Account | string): Promise<number> {
    const address = account instanceof Account ? account.address : account;
    return (await this.node.get(`/addresses/balance/${address}`)).balance;
  }

  /**
   * Set account data.
   */
  setData(account: Account, data: Record<string, number | boolean | string | Uint8Array>) {
    return new Data(data).signWith(account).broadcastTo(this.node);
  }

  /**
   * Get account data.
   */
  async getData(account: Account | string): Promise<Record<string, number | boolean | string | Binary>> {
    const address = account instanceof Account ? account.address : account;
    const dataEntries = await this.node.get(`/addresses/data/${address}`);
    return Data.from({ type: Data.TYPE, data: dataEntries }).dict;
  }
}
