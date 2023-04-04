import * as base64 from '../libs/base64';
import { sha256 } from '@noble/hashes/sha256';

export default class Request {
  protected url: URL;
  protected method: string;
  public headers: any;
  protected body: string;

  constructor(requestUrl: string, method: string, headers: any, body?: any) {
    this.url = new URL(requestUrl);
    this.method = method.toLowerCase();
    this.headers = headers;

    if (body) {
      if (typeof body == 'object') this.body = JSON.stringify(body);
      else this.body = body;

      if (!this.headers.digest) this.headers.digest = `SHA-256=${this.getDigest()}`;
    }
  }

  public getRequestTarget(): string {
    return `${this.method} ${this.url.pathname}`;
  }

  protected getDigest(): string {
    if (!this.body) throw new Error('No body set to create digest');

    return base64.encode(sha256(this.body));
  }
}
