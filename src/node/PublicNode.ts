import Transaction from '../transactions/Transaction';
import { txFromData } from '../transactions';
import axios from 'axios';
import { ITxJSON, IHash } from '../../interfaces';
import { RequestError } from '../errors';

export default class PublicNode {
  public readonly url: string;
  public readonly apiKey: string;

  constructor(url: string, apiKey = '') {
    this.url = url;
    this.apiKey = apiKey;
  }

  public async post(endpoint: string, postData: string, headers: IHash<string> = {}): Promise<any> {
    if (this.apiKey) headers['X-API-Key'] = this.apiKey;
    headers['content-type'] = 'application/json';

    const response = await axios.post(endpoint, postData, { baseURL: this.url, headers }).catch((error) => {
      throw new RequestError(this.url.concat(endpoint), error.response.data);
    });

    return response.data;
  }

  public async get(endpoint: string, headers: IHash<string> = {}): Promise<any> {
    if (this.apiKey) headers['X-API-Key'] = this.apiKey;

    const response = await axios.get(endpoint, { baseURL: this.url, headers }).catch((error) => {
      throw new RequestError(this.url.concat(endpoint), error.response.data);
    });

    return response.data;
  }

  async broadcast<T extends Transaction>(transaction: T): Promise<T> {
    const data = await this.post('/transactions/broadcast', JSON.stringify(transaction));
    return txFromData(data as ITxJSON) as T;
  }

  async submit<T extends Transaction>(transaction: T): Promise<T> {
    const data = await this.post('/transactions/submit', JSON.stringify(transaction));
    return txFromData(data as ITxJSON) as T;
  }

  public status(): Promise<{
    blockchainHeight: number;
    stateHeight: number;
    updatedTimestamp: number;
    updatedDate: string;
  }> {
    return this.get('/node/status');
  }

  public async version(): Promise<string> {
    return (await this.get('/node/version')).version;
  }
}
