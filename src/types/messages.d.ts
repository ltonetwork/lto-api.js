import { IPublicAccount } from './accounts';
import { IBinary } from './binary';

interface IMessageJSONBase {
  type: string;
  sender: IPublicAccount;
  recipient: string;
  timestamp: Date | string;
  meta: IMessageMetatype;
  signature?: string;
  hash?: string;
}

interface IMessageMetatype {
  title: string;
  description: string;
  thumbnail?: IBinary;
}

interface IMessageJSONEncrypted extends IMessageJSONBase {
  encryptedData: string;
}

interface IMessageJSONUnencrypted extends IMessageJSONBase {
  mediaType: string;
  data: string;
}

export type IMessageJSON = IMessageJSONEncrypted | IMessageJSONUnencrypted;
