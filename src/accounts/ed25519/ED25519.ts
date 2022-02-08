import { Cypher } from "../Cypher"
import { IKeyPairBytes } from "../../interfaces";
import converters from "../../libs/converters";
import crypto from "../../utils/crypto";
import * as nacl from "tweetnacl";
import base58 from "../../libs/base58";
import * as constants from "../../constants";
import encoder from "../../utils/encoder";

export class ED25519 extends Cypher {
	private sign: IKeyPairBytes;
	private encrypt: IKeyPairBytes;

	constructor(sign: IKeyPairBytes, encrypt: IKeyPairBytes) {
		super('ed25519');
		this.sign = sign;
		this.encrypt
    }

	encryptMessage(message: string | Uint8Array, theirPublicKey: string, nonce: Uint8Array): Uint8Array {
		if (!this.sign.privateKey)
			throw new Error("Missing or invalid private key");


		if (!theirPublicKey || typeof theirPublicKey !== "string")
			throw new Error("Missing or invalid public key");


		let dataBytes: Uint8Array;
		if (typeof message == "string")
			dataBytes = Uint8Array.from(converters.stringToByteArray(message));
		else
			dataBytes = message;


		const privateKeyBytes = base58.decode(this.sign.privateKey);
		const publicKeyBytes = base58.decode(theirPublicKey);

		return crypto.mergeTypedArrays(nacl.box(dataBytes, nonce, publicKeyBytes, privateKeyBytes), nonce);
	}

	decryptMessage(cypher: Uint8Array, theirPublicKey: string): string {
		const message = cypher.slice(0, -24);
		const nonce = cypher.slice(-24);

		const publicKeyBytes = base58.decode(theirPublicKey);

		return String.fromCharCode.apply(null, nacl.box.open(message, nonce, publicKeyBytes, this.sign.privateKey));
	}

    createSignature(input: string | Uint8Array, encoding = "base58") {
		
		let dataBytes: Uint8Array;
		if (typeof input === "string") 
			dataBytes = Uint8Array.from(converters.stringToByteArray(input));
		 else 
			dataBytes = input;
		
		return encoder.encode(nacl.sign.detached(dataBytes, this.sign.privateKey), "base58");
	}

    verifySignature(input: string | Uint8Array, signature: string, publicKey: string, encoding = "base58"): boolean {

		let dataBytes: Uint8Array;
		if (typeof input === "string") 
			dataBytes = Uint8Array.from(converters.stringToByteArray(input));
		 else 
			dataBytes = input;
		const signatureBytes = crypto.decode(signature, encoding);

		return nacl.sign.detached.verify(dataBytes, signatureBytes, this.sign.publicKey);
	}

}