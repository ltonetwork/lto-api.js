export { AccountFactory }

abstract class AccountFactory {
    
    chainId: string;

    constructor(chainId: string){
        this.chainId = chainId;
    }

    abstract buildSignKeyPairFromSeed(seed: string, nonce: number);

    abstract buildSignKeyPairFromSecret(privatekey: string);

    abstract create_from_private_key(privateKey: string);

    abstract create();
}