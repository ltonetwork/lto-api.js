import AccountFactory from "../AccountFactory";
import Account from "../Account";
import { IKeyPairBytes } from "../../../interfaces";
import { add_prefix } from "../../utils/encoder";
import * as crypto from "../../utils/crypto";

import { crypto as jsrsa } from "jsrsasign";
import {ECDSA} from "./ECDSA";
import Binary from "../../Binary";


export default class AccountFactoryECDSA extends AccountFactory {
	public readonly curve: string;
	static curve: any;

	constructor(chainId: string, curve = "secp256k1") {
		super(chainId);
		this.curve = curve;
	}

	private static buildSignKeyPairFromRandom(curve: string): {compressed: IKeyPairBytes, uncompressed: IKeyPairBytes} {
		const ec = new jsrsa.ECDSA({"curve": curve});
		const keypair = ec.generateKeyPairHex();

		const y = ec.getPublicKeyXYHex().y;
		const x = ec.getPublicKeyXYHex().x;

		return {
			compressed: {
				privateKey: Binary.fromHex(keypair.ecprvhex),
				publicKey: Binary.fromHex(add_prefix(x, y))
			},
			uncompressed: {
				privateKey: Binary.fromHex(keypair.ecprvhex),
				publicKey: Binary.fromHex(keypair.ecpubhex)
			}
		};
	}

	private static buildSignKeyPairFromPrivateKey(
		privateKey: string|Uint8Array,
		curve: string
	): {compressed: IKeyPairBytes, uncompressed: IKeyPairBytes} {
		const privateKeyBinary = typeof privateKey === "string"
			? Binary.fromBase58(privateKey)
			: new Binary(privateKey);
		const ec = new jsrsa.ECDSA({"curve": curve, "prv": privateKeyBinary.hex});

		const pubHex = ec.generatePublicKeyHex();
		const y = ec.getPublicKeyXYHex().y;
		const x = ec.getPublicKeyXYHex().x;

		return {
			compressed: {
				privateKey: privateKeyBinary,
				publicKey: Binary.fromHex(add_prefix(x, y))
			},
			uncompressed: {
				privateKey: privateKeyBinary,
				publicKey: Binary.fromHex(pubHex)
			}
		};
	}

	public createFromSeed(seed: string, nonce = 0): Account {
		throw new Error("Not implemented");
	}

	public createFromPublicKey(publicKey: string): Account {
		throw Error("Not implemented");
	}

	public createFromPrivateKey(privateKey: string): Account {
		const {compressed, uncompressed} = AccountFactoryECDSA.buildSignKeyPairFromPrivateKey(privateKey, this.curve);
		const cypher = new ECDSA(this.curve, uncompressed);
		const address = crypto.buildRawAddress(compressed.publicKey, this.chainId);

		return new Account(cypher, address, compressed);
	}

	public create(): Account {
		const {compressed, uncompressed} = AccountFactoryECDSA.buildSignKeyPairFromRandom(this.curve);
		const cypher = new ECDSA(this.curve, uncompressed);
		const address = crypto.buildRawAddress(compressed.publicKey, this.chainId);

		return new Account(cypher, address, compressed);
	}
}
