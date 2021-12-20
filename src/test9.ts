import { Anchor } from './classes/transactions/anchor'
import { LTO } from './LTO';
import { PublicNode } from './classes/publicNode';

const phrase = 'cool strike recall mother true topic road bright nature dilemma glide shift return mesh strategy';
let account = new LTO('T').createAccountFromExistingPhrase(phrase);

let node = new PublicNode('https://testnet.lto.network');

let transaction = new Anchor('d948152b261b505ae72300cf2ef1ae8da873687750e0cc30ee1be1526341066f')
transaction.signWith(account);

transaction.broadcastTo(node)

