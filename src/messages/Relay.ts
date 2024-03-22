import Message from './Message';
import { RequestError } from '../errors';

export default class Relay {
  constructor(public readonly url: string, public encoding: 'json' | 'binary' = 'binary') {}

  // Can be overridden by mock for testing
  private fetch(url: string, options: any): Promise<Response> {
    return fetch(url, options);
  }

  async send(message: Message): Promise<void> {
    const request = this.encoding === 'json' ? this.jsonRequest(message) : this.binaryRequest(message);

    const response = await this.fetch(this.url, request);
    if (!response.ok) throw new RequestError(this.url, await response.json());
  }

  private jsonRequest(message: Message): Record<string, any> {
    return {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(message),
    };
  }

  private binaryRequest(message: Message): Record<string, any> {
    return {
      method: 'POST',
      headers: { 'content-type': 'application/octet-stream' },
      body: message.toBinary(),
    };
  }
}
