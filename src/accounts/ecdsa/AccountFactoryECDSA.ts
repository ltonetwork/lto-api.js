import { AccountFactory } from "../AccountFactory";
import {Encoding, IKeyPairBytes} from "../../interfaces";
import base58 from "../../libs/base58";
import { encode, decode, add_prefix } from "../../utils/encoder";
import { Account } from "../Account";
import * as crypto from "../../utils/crypto";

import { crypto as jsrsa } from 'jsrsasign';
import {ECDSA} from "./ECDSA";


export class AccountFactoryECDSA extends AccountFactory {
	public readonly curve: string;
	static curve: any;

	constructor(chainId: string, curve = 'secp256k1') {
		super(chainId);
		this.curve = curve
	}

	public static buildSignKeyPairFromRandom(curve: string): {compressed: IKeyPairBytes, uncompressed: IKeyPairBytes} {
		const ec = new jsrsa.ECDSA({'curve': curve});
		const keypair = ec.generateKeyPairHex();

		const y = ec.getPublicKeyXYHex().y;
		const x = ec.getPublicKeyXYHex().x;

		return {
			compressed: {
				privateKey: decode(keypair.ecprvhex, Encoding.hex),
				publicKey: decode(add_prefix(x, y), Encoding.hex)
			},
			uncompressed: {
				privateKey: decode(keypair.ecprvhex, Encoding.hex),
				publicKey: decode(keypair.ecpubhex, Encoding.hex)

			}
		};
	}

    public static buildSignKeyPairFromPrivateKey(
		privateKey: string | Uint8Array,
		curve: string
	): {compressed: IKeyPairBytes, uncompressed: IKeyPairBytes} {
		const secretKey = typeof privateKey !== 'object' ? base58.decode(privateKey) : privateKey;
		const prvHex = encode(secretKey, Encoding.hex);
		const ec = new jsrsa.ECDSA({'curve': curve, 'prv': prvHex});

		const pubHex = ec.generatePublicKeyHex();
		const y = ec.getPublicKeyXYHex().y;
		const x = ec.getPublicKeyXYHex().x;

		return {
			compressed: {
				privateKey: secretKey,
				publicKey: decode(add_prefix(x, y),Encoding.hex)
			},
			uncompressed: {
				privateKey: secretKey,
				publicKey: decode(pubHex, Encoding.hex)

			}
		};
	}

	public createFromSeed(seed: string, nonce: number = 0): Account {
		throw new Error("Not implemented");
	}

	public createFromPublicKey(publicKey: string): Account {
		throw Error("Not implemented");
	}

	public createFromPrivateKey(privateKey: string, nonce: number = 0): Account {
		const {compressed, uncompressed} = AccountFactoryECDSA.buildSignKeyPairFromPrivateKey(privateKey, this.curve);
		const cypher = new ECDSA(this.curve, uncompressed);
		const address = crypto.buildRawAddress(compressed.publicKey, this.chainId);
		return new Account(cypher, address, compressed, undefined, undefined, nonce);
	}

	public create(nonce: number = 0): Account {
		const {compressed, uncompressed} = AccountFactoryECDSA.buildSignKeyPairFromRandom(this.curve);
		const cypher = new ECDSA(this.curve, uncompressed);
		const address = crypto.buildRawAddress(compressed.publicKey, this.chainId);
		return new Account(cypher, address, compressed, undefined, undefined, nonce);
	}
}
