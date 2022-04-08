import AccountFactory from "../AccountFactory";
import Account from "../Account";
import {IKeyPairBytes} from "../../../interfaces";
import {add_prefix, decode, encode, Encoding, getCompressPublicKey} from "../../utils/encoder";
import * as crypto from "../../utils/crypto";
import {crypto as jsrsa} from "jsrsasign";
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

	public createFromPublicKey(publicKey: string|Uint8Array): Account {
		// Todo: right now account.privateKey returns a non handled case
		let extendedPubKey: Uint8Array = null;
		if (publicKey.length > 68 && (typeof publicKey == "string")) {
			extendedPubKey = (publicKey[1] == "x") ? decode(publicKey.substring(2), Encoding.hex) :
				decode(publicKey, Encoding.hex);
			publicKey = decode(getCompressPublicKey(publicKey), Encoding.hex);
		}
		const publicKeyBinary = typeof publicKey === "string"
			? Binary.fromBase58(publicKey)
			: new Binary(publicKey);

		const compressed: IKeyPairBytes = {
			privateKey: null,
			publicKey: publicKeyBinary,
		};
		const uncompressed: IKeyPairBytes = {
			privateKey:  null,
			publicKey: new Binary(extendedPubKey),
		};
		const address = crypto.buildRawAddress(publicKeyBinary, this.chainId);
		const cypher = new ECDSA(this.curve, uncompressed);
		return new Account(cypher, address, compressed);
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
