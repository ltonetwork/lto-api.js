export { AccountFactory }

abstract class AccountFactory {
    
    chainId: string;

    constructor(chainId: string){
        this.chainId = chainId;
    }

    abstract buildSignKeyPairFromSeed(seed: string, nonce: number);

    abstract buildSignKeyPairFromPrivateKey(privatekey: string);
    
    // abstract buildSignKeyPairFromRandom();
    
    abstract createFromPrivateKey(privateKey: string);
    
    abstract createFromSeed(seed: string);

    abstract create();
}
