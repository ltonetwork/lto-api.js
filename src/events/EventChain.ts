import { Account } from "../accounts/Account";
import { Event } from "./Event";
import secureRandom from "../libs/secure-random";
import crypto from "../utils/crypto";
import base58 from "../libs/base58";

export class EventChain {

	private readonly EVENT_CHAIN_VERSION = 0x40;
	private readonly PROJECTION_ADDRESS_VERSION = 0x50;

	public id: string;
	public events: Array<Event> = [];

	constructor(id?: string, ) {
		this.id = id;
	}

	public init(account: Account, nonce?: string): void {

		const nonceBytes = nonce ? this.createNonce(nonce) : this.getRandomNonce();

		this.id = crypto.buildEvenChainId(this.EVENT_CHAIN_VERSION, account.sign.publicKey, nonceBytes);
	}

	public createProjectionId(nonce?: string): string {

		if (!this.id) 
			throw new Error("No id set for projection id");
		

		const nonceBytes = nonce ? this.createNonce(nonce) : this.getRandomNonce();

		return crypto.buildEvenChainId(this.PROJECTION_ADDRESS_VERSION, this.id, nonceBytes);
	}

	public addEvent(event: Event): Event {
		event.previous = this.getLatestHash();

		this.events.push(event);
		return event;
	}

	public getLatestHash(): string {
		if(this.events.length == 0) 
			return crypto.buildHash(base58.decode(this.id));
		

		const event = this.events.slice(-1)[0];
		return event.getHash();
	}

	public setValues(data: any): EventChain {
		if (data.id) 
			this.id = data.id;
		

		if (data.events) {
			for(const event of data.events) 
				this.events.push((<any>Object).assign(new Event(), event));
			
		}

		return this;
	}

	protected createNonce(input?: string): Uint8Array {
		return Uint8Array.from(crypto.sha256(input).slice(0, 20));
	}

	public getRandomNonce(): Uint8Array {
		return secureRandom.randomUint8Array(20);
	}
}
