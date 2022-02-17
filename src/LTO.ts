import {Account, AccountFactoryED25519, AccountFactoryECDSA, AccountFactory} from "./accounts"
import {PublicNode} from "./PublicNode";

import * as constants from "./constants";
import * as crypto from "./utils/crypto";
import {DEFAULT_CONFIG} from "./constants";

export default class LTO {
    public readonly networkByte: string;
    private _nodeAddress?: string;
    private _publicNode?: PublicNode;
    public accountFactories: {[_: string]: AccountFactory};

    constructor(networkByte = "L") {
        this.networkByte = networkByte;

        switch (this.networkByte) {
            case 'L': this.nodeAddress = constants.DEFAULT_MAINNET_NODE; break;
            case 'T': this.nodeAddress = constants.DEFAULT_TESTNET_NODE; break;
        }

        this.accountFactories = {
            ed25519: new AccountFactoryED25519(this.networkByte),
            secp256r1: new AccountFactoryECDSA(this.networkByte, 'secp256r1'),
            secp256k1: new AccountFactoryECDSA(this.networkByte, 'secp256k1')
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
    public account(
        address?: string,
        publicKey?: string,
        privateKey?: string,
        keyType = 'ed25519',
        seed?: string,
        nonce = 0
    ): Account {
        const factory = this.accountFactories[keyType];
        const account =
            seed ? factory.createFromSeed(seed, nonce) :
            privateKey ? factory.createFromPrivateKey(privateKey) :
            publicKey ? factory.createFromPublicKey(publicKey) :
            factory.create();

        return LTO.guardAccount(account, address, publicKey, privateKey);
    }

    /**
     * Encrypt seed phrase
     */
    public encryptSeedPhrase(seedPhrase: string, password: string, encryptionRounds = 5000): string {
        if (password && password.length < 8)
            console.warn("Your password may be too weak");

        if (encryptionRounds < 1000)
            console.warn("Encryption rounds may be too few");

        if (seedPhrase.length < DEFAULT_CONFIG.minimumSeedLength)
            throw new Error("The seed phrase you are trying to encrypt is too short");

        return crypto.encryptSeed(seedPhrase, password, encryptionRounds);
    }

    /**
     * Decrypt seed phrase
     */
    public decryptSeedPhrase(encryptedSeedPhrase: string, password: string, encryptionRounds = 5000): string {
        let phrase = "";

        try {
            phrase = crypto.decryptSeed(encryptedSeedPhrase, password, encryptionRounds);
        } catch (e) {
            throw new Error("Incorrect password");
        }

        if (phrase.length < DEFAULT_CONFIG.minimumSeedLength)
            throw new Error("Incorrect password");

        return phrase;
    }

    /**
     * Check if the address is valid for the current network.
     */
    public isValidAddress(address: string): boolean {
        return crypto.isValidAddress(address, this.networkByte.charCodeAt(0));
    }
}
