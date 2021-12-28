import { AccountFactory } from "../AccountFactory";

export { AccountFactoryECDSA }

class AccountFactoryECDSA extends AccountFactory {


    constructor(chainId:string) {
		super(chainId);
    }

	buildSignKeyPair(seed: string){
        // need to add the ikPairBytes interface
	}
}
