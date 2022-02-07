import { AccountFactory } from "../AccountFactory";
import { IKeyPairBytes } from "../../interfaces";
import base58 from "../../libs/base58";
import encoder from "../../utils/encoder";
import { Account } from "../Account";
import crypto from "../../utils/crypto";

import { crypto as jsrsa } from 'jsrsasign';
import {ECDSA} from "./ECDSA";

export class AccountFactoryECDSA extends AccountFactory {
	public readonly curve: string;

	constructor(chainId: string, curve = 'secp256k1') {
		super(chainId);
		this.curve = curve
	}

	private static buildSignKeyPair(ec): {compressed: IKeyPairBytes, uncompressed: IKeyPairBytes} {
		const keypair = ec.generateKeyPairHex();
		const y = ec.getPublicKeyXYHex().y;
		const x = ec.getPublicKeyXYHex().x;

		const privateKey = encoder.decode(keypair.ecprvhex, "hex");

		return {
			compressed: {
				publicKey: encoder.decode(encoder.add_prefix(x, y), "hex"),
				privateKey: privateKey.slice(0, 32)
			},
			uncompressed: {
				privateKey: encoder.decode(keypair.ecprvhex, "hex"),
				publicKey: privateKey
			}
		};
	}

	private buildAccount(ec, seed?: string, nonce: number = 0): Account {
		const {compressed, uncompressed} = AccountFactoryECDSA.buildSignKeyPair(ec);

		const cypher = new ECDSA(this.curve, uncompressed.publicKey, uncompressed.privateKey);
		const address = crypto.buildRawAddress(compressed.publicKey, this.chainId);

		return new Account(cypher, address, compressed, undefined, seed, nonce);
	}

	createFromSeed(seed: string, nonce: number = 0): Account {
		throw new Error("Method not implemented.");
	}

	createFromPrivateKey(privateKey: string): Account {
		const secretKey = typeof privateKey !== 'object' ? base58.decode(privateKey) : privateKey;
		const prvHex = encoder.encode(secretKey, "hex");
		const ec = new jsrsa.ECDSA({'curve': this.curve, 'prv': prvHex});

		return this.buildAccount(ec);
	}

	create(): Account{
		const ec = new jsrsa.ECDSA({'curve': this.curve});
		return this.buildAccount(ec);
	}
}
