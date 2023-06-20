import { Cypher } from './Cypher';
import { ED25519 } from './ed25519/ED25519';
import { ECDSA } from './ecdsa/ECDSA';
import { IBinary } from '../../interfaces';

export { default as Account } from './Account';
export { default as AccountFactory } from './AccountFactory';
export { default as AccountFactoryECDSA } from './ecdsa/AccountFactoryECDSA';
export { default as AccountFactoryED25519 } from './ed25519/AccountFactoryED25519';

export function cypher(account: { keyType: string; publicKey: IBinary }): Cypher {
  switch (account.keyType) {
    case 'ed25519':
      return new ED25519({ publicKey: account.publicKey });
    case 'secp256k1':
      return new ECDSA('secp256k1', { publicKey: account.publicKey });
    case 'secp256r1':
      return new ECDSA('secp256r1', { publicKey: account.publicKey });
    default:
      throw Error(`Unsupported key type ${account.publicKey}`);
  }
}
