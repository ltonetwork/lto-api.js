import {ILTOBasicConfig, ILTOConfig} from "../interfaces";

export const LTO = 'LTO';

export const EVENT_CHAIN_VERSION = 0x40;

export const ADDRESS_VERSION = 0x1;

export const TRANSFER_ATTACHMENT_BYTE_LIMIT: number = 140;
export const DATA_TX_SIZE_WITHOUT_ENTRIES = 52;
export const DATA_ENTRIES_BYTE_LIMIT: number = 140 * 1024 - DATA_TX_SIZE_WITHOUT_ENTRIES; // 140 kb for the whole tx

export const INITIAL_NONCE = 0;
export const PRIVATE_KEY_LENGTH = 64;
export const PUBLIC_KEY_LENGTH = 32;

export const MAINNET_BYTE: number = 'L'.charCodeAt(0);
export const TESTNET_BYTE: number = 'T'.charCodeAt(0);

export const MINIMUM_FEE = 100000;
export const MINIMUM_ISSUE_FEE = 100000000;
export const MINIMUM_MATCHER_FEE = 300000;
export const MINIMUM_DATA_FEE_PER_KB = 100000;

export const DEFAULT_BASIC_CONFIG: ILTOBasicConfig = {
  requestOffset: 0,
  requestLimit: 100,
  logLevel: 'warning',
  minimumSeedLength: 15,
  timeDiff: 0
};

export const DEFAULT_MAINNET_CONFIG: ILTOConfig = {
  ...DEFAULT_BASIC_CONFIG,
  networkByte: MAINNET_BYTE,
  nodeAddress: 'https://nodes.legalthings.one'
};

export const DEFAULT_TESTNET_CONFIG: ILTOConfig = {
  ...DEFAULT_BASIC_CONFIG,
  networkByte: TESTNET_BYTE,
  nodeAddress: 'https://testnet.legalthings.one'
};

export const enum TRANSACTION_TYPE_NUMBER {
  TRANSFER = 4,
  LEASE = 8,
  CANCEL_LEASING = 9,
  MASS_TRANSFER = 11,
  DATA = 12,
  SET_SCRIPT = 13,
  ANCHOR = 15,
  INVOKE_ASSOCIATION = 16,
  REVOKE_ASSOCIATION = 17,
  SPONSOR = 18,
  CANCEL_SPONSOR = 19,
}

export const enum TRANSACTION_TYPE {
  TRANSFER = 'transfer',
  LEASE = 'lease',
  CANCEL_LEASING = 'cancelLeasing',
  MASS_TRANSFER = 'massTransfer',
  DATA = 'data',
  SET_SCRIPT = 'setScript',
  ANCHOR = 'anchor',
  INVOKE_ASSOCIATION = 'invokeAssociation',
  REVOKE_ASSOCIATION = 'revokeAssociation',
  SPONSOR = 'sponsor',
  CANCEL_SPONSOR = 'cancelSponsor'
}

export const enum TRANSACTION_TYPE_VERSION {
  TRANSFER = 2,
  LEASE = 2,
  CANCEL_LEASING = 2,
  MASS_TRANSFER = 1,
  DATA = 1,
  SET_SCRIPT = 1,
  ANCHOR = 1,
  INVOKE_ASSOCIATION = 1,
  REVOKE_ASSOCIATION = 1,
  SPONSOR = 1,
  CANCEL_SPONSOR = 1
}

export const SET_SCRIPT_LANG_VERSION: number = 1;

export const STUB_NAME = 'reservedName';

export const BROADCAST_PATH = '/transactions/broadcast';
