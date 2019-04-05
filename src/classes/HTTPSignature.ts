import { Account } from './Account';
import { Request } from './Request';
import crypto from '../utils/crypto';
import convert from '../utils/convert';

export class HTTPSignature {

  protected request: Request;

  protected headers: Array<string>;

  protected account: Account;

  protected params: Object;

  protected clockSkew = 300;

  constructor(request: Request, headerNames?: Array<string>) {
    this.request = request;
    this.headers = headerNames;
  }


  public getParams(): Object {

    if (this.params) {
      return this.params;
    }

    if (!this.request.headers['authorization']) {
      throw new Error('no authorization header in the request');
    }

    const auth = this.request.headers['authorization'];

    const [method, ...paramStringArray] = auth.split(" ");
    const paramString = paramStringArray.join(" ");

    if (method.toLowerCase() !== 'signature') {
      throw new Error('authorization schema is not "Signature"');
    }

    const regex = /(\w+)s*=s*"([^"]+)"s*(,|$)/g;
    let match;
    this.params = {};
    while(match = regex.exec(paramString)) {
      this.params[match[1]] = match[2];
    }

    this.assertParams();

    return this.params;
  }

  public getParam(param: string): string {
    const params = this.getParams();
    return params[param];
  }

  public signWith(account: Account, algorithm = 'ed25519-sha256'): string {

    const keyId = account.getPublicSignKey();
    const signature = account.signHTTPSignature(this, algorithm, 'base64');
    const headerNames = this.headers.join(" ");

    return `keyId=\"${keyId}\",algorithm="${algorithm}",headers=\"${headerNames}\",signature="${signature}"`;
  }

  public getMessage(): string {

    return this.getHeaders()
      .map(header => {
        if (header === '(request-target)') {
          return `(request-target): ${this.request.getRequestTarget()}`
        } else {
          return `${header}: ${this.request.headers[header]}`;
        }
      }).join('\n');
  }

  public verify(): boolean {

    const signature = this.getParam('signature');
    const account = this.getAccount();
    const algorithm = this.getParam('algorithm');

    let requestBytes: Uint8Array = Uint8Array.from(convert.stringToByteArray(this.getMessage()));
    switch(algorithm) {
      case 'ed25519':
        break;

      case 'ed25519-sha256':
        requestBytes = crypto.sha256(requestBytes);
        break;

      default:
        throw new Error(`Unsupported algorithm: ${algorithm}`);
    }

    if (!account.verify(signature, requestBytes, 'base64')) {
      throw new Error("invalid signature (test)");
    }

    this.assertSignatureAge();

    return true;
  }

  protected getHeaders(): Array<string> {
    return (this.params ? this.getParam('headers').split(' ') : this.headers);
  }

  protected assertParams(): boolean {
    const required = ['keyId', 'algorithm', 'signature'];

    required.forEach((param) => {
      if (!this.params.hasOwnProperty(param)) {
        throw new Error(`${param} was not specified`);
      }
    });
    const algo = this.getParam('algorithm');

    if (['ed25519', 'ed25519-sha256'].indexOf(this.getParam('algorithm')) === -1) {
      throw new Error("only the 'ed25519' and 'ed25519-sha256' algorithms are supported");
    }

    return true;
  }

  public assertSignatureAge(): boolean {

    const date = (this.request.headers['x-date'] ? this.request.headers['x-date'] : this.request.headers['date']);

    if (!date || (Date.now() - Date.parse(date)) > (this.clockSkew * 1000)) {
      throw new Error("signature to old or clock offset");
    }

    return true;
  }

  protected getAccount(): Account {

    if (this.account) {
      return this.account;
    }

    const publickey = this.getParam('keyId');
    if (!publickey) {
      throw new Error('No public key found to verify with');
    }
    this.account = new Account();
    this.account.setPublicSignKey(publickey, 'base64');

    return this.account;
  }
}