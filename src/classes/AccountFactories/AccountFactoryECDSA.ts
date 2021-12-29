import { AccountFactory } from "../AccountFactory";
import { IKeyPairBytes } from "../../../interfaces";
import converters from "../../libs/converters";
import base58 from "../../libs/base58";
import crypto from "../../utils/crypto";


export { AccountFactoryECDSA }

class AccountFactoryECDSA extends AccountFactory {

    constructor(chainId:string) {
		super(chainId);
    }

    buildSignKeyPair(seed: string): IKeyPairBytes {
		if (!seed || typeof seed !== "string")
			throw new Error("Missing or invalid seed phras e");
		const seedBytes = Uint8Array.from(converters.stringToByteArray(seed));
		const seedHash = crypto.buildSeedHash(seedBytes);
		//const keys = nacl.sign.keyPair.fromSeed(seedHash);
        const secretKey = secp256k1.privateKeyVerify(seedHash)
        const publicKey = secp256k1.publicKeyCreate(privKey)
		return {
			privateKey: secretKey,
			publicKey: publicKey,
		};
	}
  
    buildSignKeyPairFromSecret(privatekey: string): IKeyPairBytes {
        const secretKey = base58.decode(privatekey)
		const publicKey = secp256k1.publicKeyCreate(secretKey);
		return {
			privateKey: secretKey,
			publicKey: publicKey
		};
	}

}
