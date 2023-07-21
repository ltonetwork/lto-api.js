import { IPublicAccount } from './accounts';

export interface IEventChainJSON extends Record<string, any> {
  id: string;
  events: Array<IEventJSON | { hash: string; state: string }>;
}

export interface IEventJSON {
  timestamp?: number;
  previous?: string;
  signKey?: IPublicAccount;
  signature?: string;
  hash?: string;
  mediaType: string;
  data: string;
  attachments?: Array<{ name: string; mediaType: string; data: string }>;
}
