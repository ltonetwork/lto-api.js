import {Account, AccountFactoryED25519, AccountFactoryECDSA, AccountFactory} from "./accounts";
import {PublicNode} from "./PublicNode";
import * as crypto from "./utils/crypto";
import {SEED_ENCRYPTION_ROUNDS, DEFAULT_MAINNET_NODE, DEFAULT_TESTNET_NODE} from "./constants";
import {IAccountIn} from "../interfaces";

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
}
