export { Transaction };
import { Account } from "./Account";
import base58 from "../libs/base58";
import * as nacl from "tweetnacl";
import { PublicNode } from "./publicNode";


abstract class Transaction {

	txFee = 0;
	timestamp = 0;
	proofs: Array<string> = [];
	sender = "";
	senderPublicKey = "";
	chainId = "";
	sponsor = "";
	sponsorPublicKey = "";
	senderKeyType = "ed25519";
	sponsorKeyType = "ed25519";


	isSigned() {
		return this.proofs.length != 0;
	}

    abstract toBinary()

    abstract toJson()

    signWith(account: Account) {
    	if (this.timestamp == 0)
    		this.timestamp = Date.now();

    	if (this.sender == "") {
    		this.sender = account.address;
    		this.senderPublicKey = account.getPublicSignKey();
    	}
    	this.chainId = account.networkByte;
    	this.senderKeyType = account.keyType

		this.proofs.push(base58.encode(account.signMessage(this.toBinary())));
    }

    broadcastTo(node: PublicNode) {
    	return node.broadcast(this);
    }

    sponsorWith(sponsorAccount: Account) {
    	if (!this.isSigned()) 
    		throw new Error("Transaction must be signed first");
    	

    	// add the sponsorAccountKeyType
    	this.sponsor = sponsorAccount.address;
    	this.sponsorPublicKey = sponsorAccount.getPublicSignKey("base58");
		this.sponsorKeyType = sponsorAccount.keyType;
    	this.proofs.push(base58.encode(nacl.sign.detached(this.toBinary(), base58.decode(sponsorAccount.getPrivateSignKey()))));
    }

    sponsorJson() {
    	if (this.sponsor) {
    		return {
    			"sponsor": this.sponsor,
    			"sponsorPublicKey": this.sponsorPublicKey,
    			"sponsorKeyType": this.sponsorKeyType
    		};
    	} else return {};
    }
}
