import { Account } from './Account';
import crypto from '../utils/crypto';
import convert from '../utils/convert';

export class HTTPSignature {

  public keyId: string;

  protected headerNames: string;

  public algorithm: string;

  public signature: string;

  protected headers: any;

  protected body: string;

  constructor(headers: any, body?: Object | string) {
    this.headers = headers;

    if (body) {
      if (typeof body == 'object') {
        this.body = JSON.stringify(body);
      } else {
        this.body = body;
      }
      if (!this.headers.digest) {
        this.headers.digest = this.getDigest();
      }
    }

    this.headerNames = Object.keys(this.headers).join(' ');
  }

  public getDigest(): string {
    if (!this.body) {
      throw new Error('No body set to create digest');
    }

    return crypto.buildHash(this.body, 'base64');
  }

  public getSignature(): string {
    return `keyId=\"${this.keyId}\",algorithm="${this.algorithm}",headers=\"${this.headerNames}\",signature="${this.signature}"`;
  }

  public signWith(account: Account, algorithm = 'ed25519-sha256'): HTTPSignature {

    return account.signHTTPSignature(this, algorithm);
  }

  public getMessage(): string {
    return Object.entries(this.headers)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
  }
}