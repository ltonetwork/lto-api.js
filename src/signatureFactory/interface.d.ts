export interface ISignatureGenerator {

  getSignature(privateKey: string): Promise<string>;

  getBytes(): Promise<Uint8Array>;

  getExactBytes(fieldName: string): Promise<Uint8Array>;
}

export interface ISignatureGeneratorConstructor<T> {
  new(data: T): ISignatureGenerator;
}

export interface IDEFAULT_PROPS {
  senderPublicKey: string;
  timestamp: number;
}

export interface ITRANSFER_PROPS extends IDEFAULT_PROPS {
  amount: string;
  fee: string;
  recipient: string;
  attachment: string;
}

export interface ILEASE_PROPS extends IDEFAULT_PROPS {
  recipient: string;
  amount: string;
  fee: string;
}

export interface ICANCEL_LEASING_PROPS extends IDEFAULT_PROPS {
  fee: string;
  transactionId: string;
}

export interface IMASS_TRANSFER_PROPS extends IDEFAULT_PROPS {
  assetId: string;
  transfers: Array<IMASS_TRANSFER_TRANSFERS>;
  fee: string;
  attachment: string;
}

export interface IDATA_PROPS extends IDEFAULT_PROPS {
  data: Array<IDATA_ENTRY>;
  fee: string;
}

export interface IANCHOR_PROPS extends IDEFAULT_PROPS {
  anchors: Array<string>;
  fee: string;
}

export interface IMASS_TRANSFER_TRANSFERS {
  recipient: string;
  amount: string;
}


export interface ISET_SCRIPT_PROPS extends IDEFAULT_PROPS {
  script: string;
  chainId: number;
  fee: string;
}

export interface IDATA_ENTRY {
  key: string;
  type: number | string;
  value: any;
}

export type TTX_NUMBER_MAP = {
  4: ISignatureGeneratorConstructor<ITRANSFER_PROPS>;
  7: ISignatureGeneratorConstructor<ILEASE_PROPS>;
  8: ISignatureGeneratorConstructor<ILEASE_PROPS>;
  9: ISignatureGeneratorConstructor<ICANCEL_LEASING_PROPS>;
  11: ISignatureGeneratorConstructor<IMASS_TRANSFER_PROPS>;
  12: ISignatureGeneratorConstructor<IDATA_PROPS>;
  13: ISignatureGeneratorConstructor<ISET_SCRIPT_PROPS>;
  15: ISignatureGeneratorConstructor<IANCHOR_PROPS>;
}

export type TTX_TYPE_MAP = {
  transfer: ISignatureGeneratorConstructor<ITRANSFER_PROPS>;
  exchange: ISignatureGeneratorConstructor<ILEASE_PROPS>;
  lease: ISignatureGeneratorConstructor<ILEASE_PROPS>;
  cancelLeasing: ISignatureGeneratorConstructor<ICANCEL_LEASING_PROPS>;
  massTransfer: ISignatureGeneratorConstructor<IMASS_TRANSFER_PROPS>;
  data: ISignatureGeneratorConstructor<IDATA_PROPS>;
  setScript: ISignatureGeneratorConstructor<ISET_SCRIPT_PROPS>;
  anchor: ISignatureGeneratorConstructor<IANCHOR_PROPS>;
}