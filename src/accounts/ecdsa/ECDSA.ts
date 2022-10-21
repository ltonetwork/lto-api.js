import {Cypher} from "../Cypher";
import {Encoding, decode, encode} from "../../utils/encoder";
import {crypto as jsrsa} from "jsrsasign";
import {IKeyPairBytes} from "../../../interfaces";
import {sha256} from "../../utils/sha256";

export class ECDSA extends Cypher {
	private readonly ec;
	public readonly sign: IKeyPairBytes;

	constructor(curve: string, sign: IKeyPairBytes) {
		super(curve);

		this.sign = sign;
		this.ec = new jsrsa.ECDSA({"curve": curve});
	}

	public createSignature(input: Uint8Array): Uint8Array {
		if (!this.sign.privateKey)
			throw new Error("Unable to sign: no private key");

		const signature = this.ec.signHex(sha256(input), this.sign.privateKey.hex);

		return decode(jsrsa.ECDSA.asn1SigToConcatSig(signature), Encoding.hex);
	}

	public verifySignature(input: Uint8Array, signature: Uint8Array): boolean {
		return this.ec.verifyHex(
			sha256(input),
			jsrsa.ECDSA.concatSigToASN1Sig(encode(signature, Encoding.hex)),
			encode(this.sign.publicKey, Encoding.hex)
		);
	}

	public encryptMessage(message: Uint8Array, theirPublicKey: Uint8Array): Uint8Array {
		throw new Error("Encryption not implemented for ECDSA");
	}

	public decryptMessage(cypher: Uint8Array): Uint8Array {
		throw new Error("Encryption not implemented for ECDSA");
	}
}
