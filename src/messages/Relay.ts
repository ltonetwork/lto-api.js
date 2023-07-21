import Message from './Message.js';

export default class Relay {
  constructor(public readonly url: string, public encoding: 'json' | 'binary' = 'binary') {}

  // Can be overridden by mock for testing
  private fetch(url: string, options: any): Promise<Response> {
    return fetch(url, options);
  }

  async send(message: Message): Promise<void> {
    await (this.encoding === 'json' ? this.sendJson(message) : this.sendBinary(message));
  }

  private async sendJson(message: Message): Promise<void> {
    await this.fetch(this.url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(message),
    });
  }

  private async sendBinary(message: Message): Promise<void> {
    await this.fetch(this.url, {
      method: 'POST',
      headers: { 'content-type': 'application/octet-stream' },
      body: message.toBinary(),
    });
  }
}
