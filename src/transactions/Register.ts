import Transaction from "./Transaction";
import { concatUint8Arrays } from "../utils/concat";
import base58 from "../libs/base58";
import * as convert from "../utils/convert";
import * as crypto from "../utils/crypto";
import { Account } from "../accounts";
import {IPublicAccount, ITxJSON} from "../../interfaces";

const BASE_FEE = 25000000
const VAR_FEE = 10000000
const DEFAULT_VERSION = 3;

export default class Register extends Transaction {
	public static readonly TYPE = 20;

	public accounts: IPublicAccount[];

	constructor(...accounts: (IPublicAccount|Account)[]) {
		super(Register.TYPE, DEFAULT_VERSION, BASE_FEE + accounts.length * VAR_FEE);
		this.accounts = accounts.map(this.accountToDict);

		if (this.accounts.length > 100)
			throw new Error('Too many accounts');
	}

	accountToDict(account: IPublicAccount|Account): IPublicAccount {
		return account instanceof Account
			? { keyType: account.keyType, publicKey: account.publicKey }
			: account;
	}

	private accountsToBinary(): Uint8Array {
		return this.accounts.reduce(
			(binary: Uint8Array, account: IPublicAccount) => concatUint8Arrays(
				binary,
				Uint8Array.from(convert.shortToByteArray(crypto.keyTypeId(account.keyType))),
				base58.decode(account.publicKey)
			),
			new Uint8Array()
		);
	}

	private toBinaryV3(): Uint8Array {
		return concatUint8Arrays(
			Uint8Array.from([this.type, this.version]),
			Uint8Array.from(crypto.strToBytes(this.chainId)),
			Uint8Array.from(convert.longToByteArray(this.timestamp)),
			Uint8Array.from([crypto.keyTypeId(this.senderKeyType)]),
			base58.decode(this.senderPublicKey),
			Uint8Array.from(convert.longToByteArray(this.fee)),
			Uint8Array.from(convert.shortToByteArray(this.accounts.length)),
			this.accountsToBinary()
		);
	}

	public toBinary(): Uint8Array {
		if (!this.sender) throw Error("Transaction sender not set");

		switch (this.version) {
			case 3:  return this.toBinaryV3();
			default: throw new Error("Incorrect version");
		}
	}

	public toJSON(): ITxJSON {
		return Object.assign(
			{
				id: this.id,
				type: this.type,
				version: this.version,
				sender: this.sender,
				senderKeyType: this.senderKeyType,
				senderPublicKey: this.senderPublicKey,
				fee: this.fee,
				timestamp: this.timestamp,
				accounts: this.accounts,
				proofs: this.proofs,
				height: this.height,
			},
			this.sponsorJson()
		);
	}

	public static from(data: ITxJSON): Register {
		return new Register(data.accounts).initFrom(data);
	}
}
