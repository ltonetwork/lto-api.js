import { Account } from "./Account";

export { AccountFactory }

abstract class AccountFactory {
    public readonly chainId: string;

    constructor(chainId: string){
        this.chainId = chainId;
    }

    abstract createFromPublicKey(publicKey: string): Account;

    abstract createFromPrivateKey(privateKey: string): Account;

    abstract createFromSeed(seed: string, nonce: number): Account;

    abstract create(): Account;
}
