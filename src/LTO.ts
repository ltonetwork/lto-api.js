import {Account, AccountFactoryED25519, AccountFactoryECDSA, guardAccount, AccountFactory} from "./accounts"
import {PublicNode} from "./PublicNode";
import {IKeyPairBytes} from "./interfaces";

import config from "./config";
import * as constants from "./constants";

import ed2curve from "./libs/ed2curve";
import crypto from "./utils/crypto";
import logger from "./utils/logger";

export class LTO {
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
        return this._nodeAddress;
    }

    public set publicNode(node: PublicNode) {
        this._publicNode = node;
        this._nodeAddress = node.url;
    }

    public get publicNode(): PublicNode {
        return this._publicNode;
    }

    /**
     * Create an account.
     */
    public account(
        address?: string,
        publicKey?: string,
        privateKey?: string,
        keyType = 'ed25519',
        seed?: string, nonce = 0
    ): Account {
        const factory = this.accountFactories[keyType];
        const account =
            seed ? factory.createFromSeed(seed, nonce) :
            privateKey ? factory.createFromPrivateKey(privateKey) :
            publicKey ? factory.createFromPublicKey(publicKey) :
            factory.create();

        return guardAccount(account, address, publicKey, privateKey);
    }

    /**
     * Encrypt seed phrase
     */
    public encryptSeedPhrase(seedPhrase: string, password: string, encryptionRounds = 5000): string {
        if (password && password.length < 8)
            logger.warn("Your password may be too weak");

        if (encryptionRounds < 1000)
            logger.warn("Encryption rounds may be too few");

        if (seedPhrase.length < config.getMinimumSeedLength())
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

        if (phrase.length < config.getMinimumSeedLength())
            throw new Error("Incorrect password");

        return phrase;

    }

    /**
     * Check if the address is valid for the current network.
     */
    public isValidAddress(address: string): boolean {
        return crypto.isValidAddress(address, this.networkByte.charCodeAt(0));
    }

    protected convertSignToEcnryptKeys(signKeys: IKeyPairBytes): IKeyPairBytes {
        return {
            privateKey: ed2curve.convertSecretKey(signKeys.privateKey),
            publicKey: ed2curve.convertSecretKey(signKeys.publicKey)
        };
    }
}
