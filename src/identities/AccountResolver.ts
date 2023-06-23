import { Account, AccountFactory, AccountFactoryECDSA, AccountFactoryED25519 } from '../accounts';
import { RequestError } from '../errors';

export default class AccountResolver {
  constructor(
    public readonly networkId: string,
    public readonly url: string,
    public accountFactories?: { [_: string]: AccountFactory },
  ) {
    this.accountFactories ??= {
      ed25519: new AccountFactoryED25519(this.networkId),
      secp256r1: new AccountFactoryECDSA(this.networkId, 'secp256r1'),
      secp256k1: new AccountFactoryECDSA(this.networkId, 'secp256k1'),
    };
  }

  // Can be overridden by mock for testing
  private fetch(url: string, options: any): Promise<Response> {
    return fetch(url, options);
  }

  private keyType(verificationMethodType: string) {
    switch (verificationMethodType) {
      case 'Ed25519VerificationKey2018':
        return 'ed25519';
      case 'EcdsaSecp256k1VerificationKey2019':
        return 'secp256k1';
    }
  }

  private getPublicKey(didDocument: any, methodId: string): { keyType?: string; publicKey?: string } {
    const signMethod = didDocument.verificationMethod.find((method: any) => method.id === methodId);

    if (!signMethod) return {};

    if (!signMethod.publicKeyBase58) throw new Error(`Public key of ${methodId} is not base58 encoded`);

    return {
      keyType: this.keyType(signMethod.type),
      publicKey: signMethod.publicKeyBase58,
    };
  }

  async resolve(address: string): Promise<Account> {
    const response = await this.fetch(`${this.url}/${address}`, { method: 'GET' });

    if (response.status === 404 && (await response.json()).error === 'notFound') {
      throw new Error(`Public key of ${address} is unknown`);
    }
    if (!response.ok) throw new RequestError(`${this.url}/${address}`, await response.json());

    const didDocument = await response.json();

    const { keyType, publicKey } = this.getPublicKey(didDocument, `${didDocument.id}#sign`);
    if (!publicKey) throw new Error(`Public sign key for ${address} not found in DID document 'did:lto:${address}'`);

    return this.accountFactories[keyType].createFromPublicKey(publicKey);
  }
}
