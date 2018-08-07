import crypto from "../utils/crypto";
import { URL } from 'url';

export class Request {

  protected url: URL;
  protected method: string;
  public headers: any;
  protected body: string;

  constructor(url: string, method: string, headers: any, body?: Object | string) {
    this.url = new URL(url);
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