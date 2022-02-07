import { Account } from "./Account";

export { AccountFactory }

abstract class AccountFactory {
    
    chainId: string;

    constructor(chainId: string){
        this.chainId = chainId;
    }

    abstract buildSignKeyPairFromSeed(seed: string, nonce: number);

    abstract buildSignKeyPairFromPrivateKey(privatekey: string);
    
    // abstract buildSignKeyPairFromRandom();
    
    abstract createFromPrivateKey(privateKey: string): Account;
    
    abstract createFromSeed(seed: string, nonce: number): Account;

    abstract create(): Account;
}
