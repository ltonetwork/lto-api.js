import {Account, AccountFactoryED25519, AccountFactoryECDSA, AccountFactory} from "./accounts";
import {PublicNode} from "./PublicNode";
import * as crypto from "./utils/crypto";
import {SEED_ENCRYPTION_ROUNDS, DEFAULT_MAINNET_NODE, DEFAULT_TESTNET_NODE} from "./constants";
import {IAccountIn, IHash, ITransfer} from "../interfaces";
import {
	Anchor,
	Association,
	CancelLease, CancelSponsorship, Data,
	Lease,
	MassTransfer,
	RevokeAssociation,
	Sponsorship,
	Transfer
} from "./transactions";
import Binary from "./Binary";

export default class LTO {
	public readonly networkByte: string;
	private _nodeAddress?: string;
	private _publicNode?: PublicNode;
	public accountFactories: {[_: string]: AccountFactory};

	constructor(networkByte = "L") {
		this.networkByte = networkByte;

		switch (this.networkByte) {
		case "L": this.nodeAddress = DEFAULT_MAINNET_NODE; break;
		case "T": this.nodeAddress = DEFAULT_TESTNET_NODE; break;
		}

		this.accountFactories = {
			ed25519: new AccountFactoryED25519(this.networkByte),
			secp256r1: new AccountFactoryECDSA(this.networkByte, "secp256r1"),
			secp256k1: new AccountFactoryECDSA(this.networkByte, "secp256k1")
		};
	}

	public set nodeAddress(url: string) {
		this._nodeAddress = url;
		this._publicNode = new PublicNode(url);
	}

	public get nodeAddress(): string {
		if (!this._nodeAddress) throw Error("Public node not configured");
		return this._nodeAddress;
	}

	public set publicNode(node: PublicNode) {
		this._publicNode = node;
		this._nodeAddress = node.url;
	}

	public get publicNode(): PublicNode {
		if (!this._publicNode) throw Error("Public node not configured");
		return this._publicNode;
	}

	private static guardAccount(account: Account, address?: string, publicKey?: string, privateKey?: string): Account {
		if (privateKey && account.privateKey !== privateKey) throw Error("Private key mismatch");
		if (publicKey && account.publicKey !== publicKey) throw Error("Public key mismatch");
		if (address && account.address !== address) throw Error("Address mismatch");

		return account;
	}

	/**
     * Create an account.
     */
	public account(settings: IAccountIn = {}): Account {
		const factory = this.accountFactories[settings.keyType ?? "ed25519"];
		let account: Account;

		if (settings.seed) {
			const seed = settings.seedPassword
				? crypto.decryptSeed(settings.seed, settings.seedPassword, SEED_ENCRYPTION_ROUNDS)
				: settings.seed;
			account = factory.createFromSeed(seed, settings.nonce ?? 0);
		} else if (settings.privateKey) {
			account = factory.createFromPrivateKey(settings.privateKey);
		} else if (settings.publicKey) {
			account = factory.createFromPublicKey(settings.publicKey);
		} else {
			account = factory.create();
		}

		return LTO.guardAccount(account, settings.address, settings.publicKey, settings.privateKey);
	}

	/**
     * Check if the address is valid for the current network.
     */
	public isValidAddress(address: string): boolean {
		return crypto.isValidAddress(address, this.networkByte.charCodeAt(0));
	}


	/**
	 * Transfer LTO from account to recipient.
	 * Amount is number of LTO * 10^8.
	 */
	public transfer(sender: Account, recipient: string, amount: number, attachment: Uint8Array|string = ""): Promise<Transfer> {
		return new Transfer(recipient, amount, attachment).signWith(sender).broadcastTo(this.publicNode);
	}

	/**
	 * Transfer LTO from one account to up to 100 recipients.
	 */
	public massTransfer(sender: Account, transfers: ITransfer[], attachment: Uint8Array|string = ""): Promise<MassTransfer> {
		return new MassTransfer(transfers, attachment).signWith(sender).broadcastTo(this.publicNode);
	}

	/**
	 * Write one or more hashes to the blockchain.
	 */
	public anchor(sender: Account, ...anchors: Uint8Array[]): Promise<Anchor> {
		return new Anchor(...anchors).signWith(sender).broadcastTo(this.publicNode);
	}

	/**
	 * Issue an association between accounts.
	 */
	public issueAssociation(sender: Account, recipient: string, type: number, hash?: Uint8Array, expires?: Date|number): Promise<Association> {
		return new Association(recipient, type, hash, expires).signWith(sender).broadcastTo(this.publicNode);
	}

	/**
	 * Revoke an association between accounts.
	 */
	public revokeAssociation(sender: Account, recipient: string, type: number, hash?: Uint8Array): Promise<RevokeAssociation> {
		return new RevokeAssociation(recipient, type, hash).signWith(sender).broadcastTo(this.publicNode);
	}

	/**
	 * Lease an amount to a public node for staking.
	 */
	public lease(sender: Account, recipient: string, amount: number): Promise<Lease> {
		return new Lease(recipient, amount).signWith(sender).broadcastTo(this.publicNode);
	}

	/**
	 * Cancel a staking lease.
	 */
	public cancelLease(sender: Account, leaseId: string): Promise<CancelLease> {
		return new CancelLease(leaseId).signWith(sender).broadcastTo(this.publicNode);
	}

	/**
	 * Sponsor an account.
	 */
	public sponsor(sender: Account, recipient: string): Promise<Sponsorship> {
		return new Sponsorship(recipient).signWith(sender).broadcastTo(this.publicNode);
	}

	/**
	 * Stop sponsoring an account.
	 */
	public cancelSponsorship(sender: Account, recipient: string): Promise<CancelSponsorship> {
		return new CancelSponsorship(recipient).signWith(sender).broadcastTo(this.publicNode);
	}


	/**
	 * Get the current account balance.
	 */
	public async getBalance(account: Account|string): Promise<number> {
		const address = account instanceof Account ? account.address : account;
		return (await this.publicNode.get(`/addresses/balance/${address}`)).balance;
	}

	/**
	 * Set account data.
	 */
	public setData(account: Account, data: IHash<number|boolean|string|Uint8Array>) {
		return new Data(data).signWith(account).broadcastTo(this.publicNode);
	}

	/**
	 * Get account data.
	 */
	public async getData(account: Account|string): Promise<IHash<number|boolean|string|Binary>> {
		const address = account instanceof Account ? account.address : account;
		const dataEntries = await this.publicNode.get(`/addresses/data/${address}`);
		return Data.from({type: Data.TYPE, data: dataEntries}).dict;
	}
}
