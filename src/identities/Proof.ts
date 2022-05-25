import {Account} from "../accounts";
import {IProofable} from "../../interfaces";

export default class Proof {
	type: string;
	created: Date;
	verificationMethod: string;
	proofPurpose: string;
	proofValue: string;

	static of(subject: IProofable|string, account: Account, purpose: "assertionMethod"|"authentication" = "assertionMethod"): Proof {
		const proof = new Proof();

		proof.type = Proof.signatureTypeOfAccount(account);
		proof.created = new Date();
		proof.verificationMethod = account.did + "#sign";
		proof.proofPurpose = purpose;
		proof.proofValue = account.sign(typeof subject == "string" ? subject : subject.canonicalize()).base58;

		return proof;
	}

	static signatureTypeOfAccount(account: Account) {
		switch (account.keyType) {
		case "ed25519": return "Ed25519Signature2020";
		default: throw Error("Unsupported key type");
		}
	}
}
