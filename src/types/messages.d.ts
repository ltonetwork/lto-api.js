import { IPublicAccount } from './accounts';

interface IMessageJSONBase {
  type: string;
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
