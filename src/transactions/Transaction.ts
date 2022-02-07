export { Transaction };
import { Account } from "../accounts/Account";
import base58 from "../libs/base58";
import * as nacl from "tweetnacl";
import { PublicNode } from "../PublicNode";


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
    		this.senderPublicKey = account.getPublicVerifyKey();
    	}
    	this.chainId = account.networkByte;
    	this.senderKeyType = account.cypher.keyType
		this.proofs.push(account.Sign(this.toBinary()));
    }

    broadcastTo(node: PublicNode) {
    	return node.broadcast(this);
    }

    sponsorWith(sponsorAccount: Account) {
    	if (!this.isSigned()) 
    		throw new Error("Transaction must be signed first");
    	

    	// add the sponsorAccountKeyType
    	this.sponsor = sponsorAccount.address;
    	this.sponsorPublicKey = sponsorAccount.getPublicVerifyKey("base58");
		this.sponsorKeyType = sponsorAccount.cypher.keyType;
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
