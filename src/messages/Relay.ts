import Message from './Message';

export default class Relay {
  constructor(public readonly url: string) {}

  // Can be overridden by mock for testing
  private fetch(url: string, options: any): Promise<Response> {
    return fetch(url, options);
  }

  async send(message: Message): Promise<void> {
    await this.fetch(this.url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(message),
    });
  }
}
