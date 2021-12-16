
class Transaction{

    txFee: number = 0;
    timestamp: number = 0;
    proofs: Array<string>;
    sender: string;
    senderPublicKey: string;
    chainId: string;
    sponsor:  string;
    sponsorPublicKey:  string; 
    senderKeyType:  string = 'ed25519'; 
    sponsorKeyType:  string = 'ed25519';



}
