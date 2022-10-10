import {IHash, IProofable} from "../../interfaces";
import {Account} from "../accounts";
import Credential from "./Credential";
import Proof from "./Proof";
import {PublicNode} from "../node";
import Binary from "../Binary";
import {Association, RevokeAssociation} from "../transactions";


export default class VerifiableCredential<T extends Credential> implements IProofable {
	id: string;
	issuer: Account;
	issued: Date;
	validFrom: Date;
	validUntil?: Date;
	credentialSubject: T;
	proof: Proof;

	constructor(credential: T) {
		this.credentialSubject = credential;
	}

	static from(data: IHash<any>): VerifiableCredential<Credential&IHash<any>> {
		const credential: Credential&IHash<any> = new Credential(data.credentialSchema.id, data.type);
		const vc = new this(credential);

		vc.id = data.id;
		vc.issuer = data.issuer;

		if (data.issued) vc.issued = data.issued instanceof Date ? data.issued : new Date(data.issued);
		if (data.validFrom) vc.validFrom = data.validFrom instanceof Date ? data.validFrom : new Date(data.validFrom);
		if (data.validUntil) vc.validUntil = data.validUntil instanceof Date ? data.validUntil : new Date(data.validUntil);

		if (data.proof) vc.proof = Object.assign(new Proof(), data.proof);

		return vc;
	}


	public get credentialSchema(): {id: string, type: string} {
		return {
			id: this.credentialSubject.$schema,
			type: "FullJsonSchemaValidator2021"
		};
	}

	public get type(): string[] {
		return ["VerifiableCredential"].concat(...this.credentialSubject.$type);
	}

	issueWith(issuer: Account): this {
		this.id = (Math.random() + 1).toString(36).substring(2);
		this.issuer = issuer;

		this.issued = this.issued ?? new Date();
		this.validFrom = this.validFrom ?? this.issued;

		this.proof = Proof.of(this, issuer);

		return this;
	}

	toJSON(): object {
		return {
			"@context": ["https://www.w3.org/2018/credentials/v1"],
			"id": this.id,
			"type": this.type,
			"issuer": this.issuer.did,
			"issued": this.issued,
			"issuanceDate": this.issued,
			"validFrom": this.validFrom,
			"validUntil": this.validUntil,
			"expirationDate": this.validUntil,
			"credentialSubject": this.credentialSubject,
			"credentialSchema": this.credentialSchema,
			"proof": this.proof,
		};
	}

	canonicalize(): string {
		return JSON.stringify(this); // TODO use JSON-LD with canonize
	}

	get hash(): Binary {
		return new Binary(this.canonicalize()).hash();
	}

	private getRecipient(): string {
		const id = (this.credentialSubject as IHash<any>).id;

		if (typeof id !== "string") {
			throw new Error("Credential subject has no or invalid id property");
		}

		if (!id.startsWith("did:lto:")) {
			throw new Error(`Unable to extract LTO address from subject id '${id}'`);
		}

		return id.replace(/^did:lto:/, "");
	}

	async register(node: PublicNode): Promise<Association> {
		return new Association(0x10, this.getRecipient(), this.hash, this.validUntil)
			.signWith(this.issuer)
			.broadcastTo(node);
	}

	async revoke(node: PublicNode): Promise<RevokeAssociation> {
		return new RevokeAssociation(0x10, this.getRecipient(), this.hash)
			.signWith(this.issuer)
			.broadcastTo(node);
	}
}




