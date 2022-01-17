export { AccountFactory }

abstract class AccountFactory {
    
    chainId: string;

    constructor(chainId: string){
        this.chainId = chainId;
    }

    abstract buildSignKeyPair(seed: string, nonce: number)

    abstract buildSignKeyPairFromSecret(privatekey: string)
}