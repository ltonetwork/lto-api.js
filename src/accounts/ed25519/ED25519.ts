import { Cypher } from "../Cypher";
import {IKeyPairBytes} from "../../../interfaces";
import * as nacl from "tweetnacl";
import ed2curve from "../../libs/ed2curve";
import {DecryptError} from "../../errors/";
import {mergeTypedArrays} from "../../utils/byte-array";
import {randomNonce} from "../../utils/crypto";

export class ED25519 extends Cypher {
	private sign: IKeyPairBytes;
	private encrypt?: IKeyPairBytes;

	constructor(sign: IKeyPairBytes, encrypt?: IKeyPairBytes) {
		super("ed25519");

		if (!encrypt) encrypt =	{
			privateKey: sign.privateKey ? ed2curve.convertSecretKey(sign.privateKey) : undefined,
			publicKey: ed2curve.convertSecretKey(sign.publicKey)
		};

		this.sign = sign;
		this.encrypt = encrypt;
	}

	public encryptMessage(input: Uint8Array, theirPublicKey: Uint8Array): Uint8Array {
		if (!this.encrypt.privateKey)
			throw new Error("Missing private key for encryption");

		const nonce = randomNonce();

		return mergeTypedArrays(nacl.box(input, nonce, theirPublicKey, this.sign.privateKey), nonce);
	}

	public decryptMessage(cypher: Uint8Array, theirPublicKey: Uint8Array): Uint8Array {
		const message = cypher.slice(0, -24);
		const nonce = cypher.slice(-24);

		const output = nacl.box.open(message, nonce, theirPublicKey, this.sign.privateKey);

		if (!output)
			throw new DecryptError("Unable to decrypt message with given keys");

		return output;
	}

	public createSignature(input: Uint8Array): Uint8Array {
		if (!this.sign.privateKey)
			throw new Error("Missing private key for signing");

		return nacl.sign.detached(input, this.sign.privateKey);
	}

	public verifySignature(input: Uint8Array, signature: Uint8Array): boolean {
		return nacl.sign.detached.verify(input, signature, this.sign.publicKey);
	}
}
