import { Anchor } from './classes/transactions/anchor'
import { LTO } from './LTO';
import { PublicNode } from './classes/publicNode';
import { getPositionOfLineAndCharacter, moveSyntheticComments } from 'typescript';
import { type } from 'os';
import { typeOf } from 'ts-utils';
import { __awaiter } from 'tslib';

const phrase = 'cool strike recall mother true topic road bright nature dilemma glide shift return mesh strategy';
let account = new LTO('T').createAccountFromExistingPhrase(phrase);

let node = new PublicNode('https://testnet.lto.network');

let transaction = new Anchor('d948152b261b505ae72300cf2ef1ae8da873687750e0cc30ee1be1526341066f')
transaction.signWith(account);
async function my(){
    let ret = await transaction.broadcastTo(node);
    console.log(ret)
}
my();



//let header = {"X-API-Key": ''}

//console.log(Object.assign({}, header, {'content-type': 'application/json'}))

let data = {
    type: 15,
    version: 3,
    id: 'BpUq7pRX6b8GFHMR5AcQ99twcfPixBtfbtVn8vbA1iKf',
    sender: '3N5PoiMisnbNPseVXcCa5WDRLLHkj7dz4Du',
    senderKeyType: 'ed25519',
    senderPublicKey: 'AneNBwCMTG1YQ5ShPErzJZETTsHEWFnPWhdkKiHG6VTX',
    fee: 35000000,
    timestamp: 1639762065696,
    anchors: [
      '27DwT2ER34qA8mreoswvLvFteeiJieWgJkEZehY4nDcjjdXTiC8gfX5aBFYpET1bqCZ3zgHj4KxLCSPYzqQHzDbx'
    ],
    proofs: [
      '4PsVCrWYUgtvHXDzi6P26xTQbevFzqJHmxqM1Emg3dpdDiJi4g1FRaqH499DTSMtezv32ypn41te5PtGTSL1PyjL'
    ]
  }
/*console.log(data['type'])
switch(data.type) {
    case 15:
      console.log("is the anchor")
      break;
    case 5:
        break;
    default:
      console.error("Transaction type not recognized")
  }*/