import { AccountFactory } from "../AccountFactory";
import { IKeyPairBytes } from "../../../interfaces";
import converters from "../../libs/converters";
import crypto from "../../utils/crypto";
import * as nacl from "tweetnacl";

export { AccountFactoryED25519 }

class AccountFactoryED25519 extends AccountFactory {

    constructor(chainId:string) {
		super(chainId);
    }

	buildSignKeyPair(seed: string): IKeyPairBytes {
		if (!seed || typeof seed !== "string")
			throw new Error("Missing or invalid seed phras e");
		const seedBytes = Uint8Array.from(converters.stringToByteArray(seed));
		const seedHash = crypto.buildSeedHash(seedBytes);
		const keys = nacl.sign.keyPair.fromSeed(seedHash);
		return {
			privateKey: keys.secretKey,
			publicKey: keys.publicKey,
		};
	}
}
