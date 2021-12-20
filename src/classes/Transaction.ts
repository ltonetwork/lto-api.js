export { Transaction };
import config from '../config';
import { Account } from './Account';

function getTimestamp(timestamp?) {
  return (timestamp || Date.now()) + config.getTimeDiff();
}

class Transaction{

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

    signWith(account: Account){

        if (this.timestamp == 0) 
            this.timestamp = Date.now();
        
        if (this.sender == ''){
            this.sender = account.address;
            this.senderPublicKey = account.getPublicSignKey('base58');
        }

        this.chainId = account.get_network()
        //this.senderKeyType = account.key_type

        this.proofs.append(account.sign(this.to_binary()))
    }
}
