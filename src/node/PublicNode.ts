import Transaction from '../transactions/Transaction';
import { txFromData } from '../transactions';
import { ITxJSON } from '../types';
import { RequestError } from '../errors';

export default class PublicNode {
  readonly url: string;
  readonly apiKey: string;

  constructor(url: string, apiKey = '') {
    this.url = url.replace(/\/$/, '');
    this.apiKey = apiKey;
  }

  // Can be overridden by mock for testing
  private fetch(url: string, options: any): Promise<Response> {
    return fetch(url, options);
  }

  async post(endpoint: string, postData: any, headers: Record<string, string> = {}): Promise<any> {
    endpoint = endpoint.replace(/^\//, '');
    if (this.apiKey) headers['X-API-Key'] = this.apiKey;
    headers['content-type'] = 'application/json';
    const body = typeof postData === 'string' ? postData : JSON.stringify(postData);

    const response = await this.fetch(`${this.url}/${endpoint}`, { method: 'POST', headers, body });

    if (!response.ok) throw new RequestError(`${this.url}/${endpoint}`, await response.json());
    return await response.json();
  }

  async get(endpoint: string, headers: Record<string, string> = {}): Promise<any> {
    endpoint = endpoint.replace(/^\//, '');
    if (this.apiKey) headers['X-API-Key'] = this.apiKey;

    const response = await this.fetch(`${this.url}/${endpoint}`, { method: 'GET', headers });

    if (!response.ok) throw new RequestError(`${this.url}/${endpoint}`, await response.json());
    return await response.json();
  }

  async broadcast<T extends Transaction>(transaction: T): Promise<T> {
    const data = await this.post('/transactions/broadcast', transaction);
    return txFromData(data as ITxJSON) as T;
  }

  async submit<T extends Transaction>(transaction: T): Promise<T> {
    const data = await this.post('/transactions/submit', transaction);
    return txFromData(data as ITxJSON) as T;
  }

  status(): Promise<{
    blockchainHeight: number;
    stateHeight: number;
    updatedTimestamp: number;
    updatedDate: string;
  }> {
    return this.get('/node/status');
  }

  async version(): Promise<string> {
    return (await this.get('/node/version')).version;
  }
}
