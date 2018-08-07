import crypto from "../utils/crypto";
import * as url from 'url';

export class Request {

  protected url: any;
  protected method: string;
  public headers: any;
  protected body: string;

  constructor(requestUrl: string, method: string, headers: any, body?: Object | string) {
    this.url = url.parse(requestUrl)
    this.method = method.toLowerCase();
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
  }

  public getRequestTarget(): string {
    return `${this.method} ${this.url.pathname}`;
  }

  protected getDigest(): string {
    if (!this.body) {
      throw new Error('No body set to create digest');
    }

    return crypto.buildHash(this.body, 'base64');
  }
}