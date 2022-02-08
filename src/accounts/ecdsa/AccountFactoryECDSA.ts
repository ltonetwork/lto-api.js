import { AccountFactory } from "../AccountFactory";
import { IKeyPairBytes } from "../../interfaces";
import base58 from "../../libs/base58";
import encoder from "../../utils/encoder";
import { Account } from "../Account";
import crypto from "../../utils/crypto";

import { crypto as jsrsa } from 'jsrsasign';
import {ECDSA} from "./ECDSA";
import { generateKeyPair } from "crypto";

export class AccountFactoryECDSA extends AccountFactory {
	public readonly curve: string;
	static curve: any;

	constructor(chainId: string, curve = 'secp256k1') {
		super(chainId);
		this.curve = curve
	}

	public static buildSignKeyPairFromRandom(): {compressed: IKeyPairBytes, uncompressed: IKeyPairBytes} {
		const ec = new jsrsa.ECDSA({'curve': this.curve});
		var keypair = ec.generateKeyPairHex();

		let y = ec.getPublicKeyXYHex().y;
		let x = ec.getPublicKeyXYHex().x;

		return {
			compressed: {
				privateKey: encoder.decode(keypair.ecprvhex, "hex"),
				publicKey: encoder.decode(encoder.add_prefix(x, y),"hex")
			},
			uncompressed: {
				privateKey: encoder.decode(keypair.ecprvhex, "hex"),
				publicKey: encoder.decode(keypair.ecpubhex, "hex")

			}
		};
	}

    public static buildSignKeyPairFromPrivateKey(privateKey: string | Uint8Array): {compressed: IKeyPairBytes, uncompressed: IKeyPairBytes} {
		const secretKey = typeof privateKey !== 'object' ? base58.decode(privateKey) : privateKey;
		const prvHex = encoder.encode(secretKey, "hex");

		const ec = new jsrsa.ECDSA({'curve': this.curve, 'prv': prvHex});
		var pubHex = ec.generatePublicKeyHex();
		let y = ec.getPublicKeyXYHex().y;
		let x = ec.getPublicKeyXYHex().x;

		return {
			compressed: {
				privateKey: secretKey,
				publicKey: encoder.decode(encoder.add_prefix(x, y),"hex")
			},
			uncompressed: {
				privateKey: secretKey,
				publicKey: encoder.decode(pubHex, "hex")

			}
		};
	}

	createFromSeed(seed: string, nonce: number = 0): Account {
		throw new Error("Method not implemented.");
	}

	createFromPrivateKey(privateKey: string, nonce: number = 0): Account {
		const {compressed, uncompressed} = AccountFactoryECDSA.buildSignKeyPairFromPrivateKey(privateKey);
		const cypher = new ECDSA(this.curve, uncompressed);
		const address = crypto.buildRawAddress(compressed.publicKey, this.chainId);
		return new Account(cypher, address, compressed, undefined, undefined, nonce);
	}

	create(nonce: number = 0): Account{
		const {compressed, uncompressed} = AccountFactoryECDSA.buildSignKeyPairFromRandom();
		const cypher = new ECDSA(this.curve, uncompressed);
		const address = crypto.buildRawAddress(compressed.publicKey, this.chainId);
		return new Account(cypher, address, compressed, undefined, undefined, nonce);
	}
}
