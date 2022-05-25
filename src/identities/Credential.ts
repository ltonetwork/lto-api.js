import Account from "../accounts/Account";
import VerifiableCredential from "./VerifiableCredential";

export default class Credential {
	public $schema: string;
	public $type: string[];

	constructor(schema: string, type: string[] = []) {
		this.$schema = schema;
		this.$type = type;
	}

	asVerifiableCredential(issuer?: Account): VerifiableCredential<this> {
		const vc = new VerifiableCredential(this);
		if (issuer) vc.issueWith(issuer);

		return vc;
	}



	toJson(): object {
		const data = { ...this };

		delete data.$schema;
		delete data.$type;

		return data;
	}
}
