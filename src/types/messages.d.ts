import { IPublicAccount } from './accounts';
import { IBinary } from './binary';

export interface IMessageMeta {
  type: string;
  title: string;
  description: string;
  thumbnail?: IBinary;
}

interface IMessageJSONBase {
  version: number;
  meta: {
    type: string;
    title: string;
    description: string;
    thumbnail?: string;
  };
  sender: IPublicAccount;
  recipient: string;
  timestamp: Date | string;
  signature?: string;
  hash?: string;
}

interface IMessageJSONEncrypted extends IMessageJSONBase {
  encryptedData: string;
}

interface IMessageJSONUnencrypted extends IMessageJSONBase {
  mediaType: string;
  data: string;
}

export type IMessageJSON = IMessageJSONEncrypted | IMessageJSONUnencrypted;
