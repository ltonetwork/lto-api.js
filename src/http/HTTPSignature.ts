import {Account} from "../accounts";
import Request from "./Request";
import * as crypto from "../utils/crypto";
import * as convert from "../utils/convert";
import {ED25519} from "../accounts/ed25519/ED25519";
import Binary from "../Binary";

export default class HTTPSignature {
	protected request: Request;
	protected headers: Array<string>;
	protected params: object;

	protected clockSkew = 300;

	constructor(request: Request, headerNames?: Array<string>) {
		this.request = request;
		this.headers = headerNames;
	}

	private requestBytes(algorithm: string): Uint8Array {
		let requestBytes: Uint8Array = Uint8Array.from(convert.stringToByteArray(this.getMessage()));

		switch (algorithm) {
		case "ed25519":
			break;
		case "ed25519-sha256":
			requestBytes = crypto.sha256(requestBytes);
			break;
		default:
			throw new Error(`Unsupported algorithm: ${algorithm}`);
		}

		return requestBytes;
	}

	public getParams(): object {
		if (this.params) 
			return this.params;

		if (!this.request.headers["authorization"]) 
			throw new Error("no authorization header in the request");
		
		const auth = this.request.headers["authorization"];

		const [method, ...paramStringArray] = auth.split(" ");
		const paramString = paramStringArray.join(" ");

		if (method.toLowerCase() !== "signature") 
			throw new Error("authorization schema is not \"Signature\"");

		const regex = /(\w+)s*=s*"([^"]+)"s*(,|$)/g;
		let match;
		this.params = {};
		while(match = regex.exec(paramString)) 
			this.params[match[1]] = match[2];
		
		this.assertParams();

		return this.params;
	}

	public getParam(param: string): string {
		const params = this.getParams();
		return params[param];
	}

	public signWith(account: Account, algorithm = "ed25519-sha256"): string {
		const keyId = account.publicKey;
		const signature = account.sign(this.requestBytes(algorithm)).base64;
		const headerNames = this.headers.join(" ");

		return `keyId="${keyId}",algorithm="${algorithm}",headers="${headerNames}",signature="${signature}"`;
	}

	public getMessage(): string {
		return this.getHeaders()
			.map(header => {
				if (header === "(request-target)") 
					return `(request-target): ${this.request.getRequestTarget()}`;
				else
					return `${header}: ${this.request.headers[header]}`;
				
			}).join("\n");
	}

	public verify(): void {
		const keyId = this.getParam("keyId");
		const signature = this.getParam("signature");
		const algorithm = this.getParam("algorithm");

		const crypto = new ED25519({publicKey: Binary.fromBase58(keyId)});
		const bytes = this.requestBytes(algorithm);

		if (!crypto.verifySignature(bytes, Binary.fromBase64(signature)))
			throw new Error("invalid signature");

		this.assertSignatureAge();
	}

	protected getHeaders(): Array<string> {
		return (this.params ? this.getParam("headers").split(" ") : this.headers);
	}

	protected assertParams(): void {
		const required = ["keyId", "algorithm", "signature"];
		const algo = this.getParam("algorithm");

		required.forEach((param) => {
			if (!this.params.hasOwnProperty(param)) 
				throw new Error(`${param} was not specified`);
		});

		if (algo !== "ed25519" && algo !== "ed25519-sha256")
			throw new Error("only the 'ed25519' and 'ed25519-sha256' algorithms are supported");
	}

	public assertSignatureAge(): void {
		const date = (this.request.headers["x-date"] ? this.request.headers["x-date"] : this.request.headers["date"]);

		if (!date || (Date.now() - Date.parse(date)) > (this.clockSkew * 1000)) 
			throw new Error("signature to old or clock offset");
	}
}
