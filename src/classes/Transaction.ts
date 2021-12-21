export { Transaction };
import config from '../config';
import { Account } from './Account';
import base58 from '../libs/base58';
import * as nacl from 'tweetnacl';
import {PublicNode} from './publicNode'


abstract class Transaction {

    txFee: number = 0;
    timestamp: number = 0;
    proofs: Array<string> = [];
    sender: string = '';
    senderPublicKey: string = '';
    chainId: string = '';
    sponsor:  string = '';
    sponsorPublicKey:  string = ''; 
    senderKeyType:  string = 'ed25519'; 
    sponsorKeyType:  string = 'ed25519';
    

    isSigned(){
        return this.proofs.length != 0;
    }
    
    abstract toBinary() 

    abstract toJson()

    signWith(account: Account){

        if (this.timestamp == 0) 
            this.timestamp = Date.now();
        
        if (this.sender == ''){
            this.sender = account.address;
            this.senderPublicKey = account.getPublicSignKey();
        }
        this.chainId = account.networkByte;
        //this.senderKeyType = account.key_type

        this.proofs.push(base58.encode(nacl.sign.detached(this.toBinary(), base58.decode(account.getPrivateSignKey()))));
    }

    broadcastTo(node: PublicNode){
        return node.broadcast(this);
    }

    sponsorWith(sponsorAccount: Account){
        if (!this.isSigned()){
            throw new Error('Transaction must be signed first');
        }

        // add the sponsorAccountKeyType
        this.sponsor = sponsorAccount.address;
        this.sponsorPublicKey = sponsorAccount.getPublicSignKey('base58');
        this.proofs.push(base58.encode(nacl.sign.detached(this.toBinary(), base58.decode(sponsorAccount.getPrivateSignKey()))));
    }

    sponsorJson(){
        if (this.sponsor){
            return {
                "sponsor": this.sponsor,
                "sponsorPublicKey": this.sponsorPublicKey,
                "sponsorKeyType": this.sponsorKeyType
            }
        }
        else return {}
    }
}
