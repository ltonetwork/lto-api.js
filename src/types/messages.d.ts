import { IPublicAccount } from './accounts';

interface IMessageJSONBase {
  type: string;
  sender: IPublicAccount;
  recipient: string;
  timestamp: Date | string;
  messageInfo?: MessageInfo;
  signature?: string;
  hash?: string;
}

interface MessageInfo {
  title: string;
  description?: string;
  thumbnail?: string;
}

interface IMessageJSONEncrypted extends IMessageJSONBase {
  encryptedData: string;
}

interface IMessageJSONUnencrypted extends IMessageJSONBase {
  mediaType: string;
  data: string;
}

export type IMessageJSON = IMessageJSONEncrypted | IMessageJSONUnencrypted;
