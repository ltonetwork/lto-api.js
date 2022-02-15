import { Cypher } from "../Cypher"
import {Encoding, IKeyPairBytes} from "../../interfaces";
import converters from "../../libs/converters";
import * as crypto from "../../utils/crypto";
import * as nacl from "tweetnacl";
import base58 from "../../libs/base58";
import {encode} from "../../utils/encoder";
import ed2curve from "../../libs/ed2curve";

export class ED25519 extends Cypher {
	private sign: IKeyPairBytes;
	private encrypt?: IKeyPairBytes;

	constructor(sign: IKeyPairBytes, encrypt?: IKeyPairBytes) {
		super('ed25519');

		if (!encrypt) encrypt =	{
			privateKey: sign.privateKey ? ed2curve.convertSecretKey(sign.privateKey) : undefined,
			publicKey: ed2curve.convertSecretKey(sign.publicKey)
		};

		this.sign = sign;
		this.encrypt = encrypt;
    }

	public encryptMessage(message: string|Uint8Array, theirPublicKey: string, nonce: Uint8Array): Uint8Array {
		if (!this.encrypt.privateKey)
			throw new Error("Missing or invalid private key");

		const dataBytes: Uint8Array = typeof message == "string"
			? Uint8Array.from(converters.stringToByteArray(message))
			: message;

		const privateKeyBytes = base58.decode(this.sign.privateKey);
		const publicKeyBytes = base58.decode(theirPublicKey);

		return crypto.mergeTypedArrays(nacl.box(dataBytes, nonce, publicKeyBytes, privateKeyBytes), nonce);
	}

	public decryptMessage(cypher: Uint8Array, theirPublicKey: string): string {
		const message = cypher.slice(0, -24);
		const nonce = cypher.slice(-24);

		const publicKeyBytes = base58.decode(theirPublicKey);
		const dataBytes = nacl.box.open(message, nonce, publicKeyBytes, this.sign.privateKey);

		return String.fromCharCode.apply(null, dataBytes);
	}

	public createSignature(input: string|Uint8Array, encoding: Encoding = Encoding.base58) {
		if (!this.sign.privateKey)
			throw new Error("Missing or invalid private key");

		const dataBytes = typeof input === "string"
			? Uint8Array.from(converters.stringToByteArray(input))
		 	: input;
		
		return encode(nacl.sign.detached(dataBytes, this.sign.privateKey), Encoding.base58);
	}

	public verifySignature(input: string|Uint8Array, signature: string, encoding = Encoding.base58): boolean {
		const dataBytes = typeof input === "string"
			? Uint8Array.from(converters.stringToByteArray(input))
		 	: input;
		const signatureBytes = crypto.decode(signature, encoding);

		return nacl.sign.detached.verify(dataBytes, signatureBytes, this.sign.publicKey);
	}
}
