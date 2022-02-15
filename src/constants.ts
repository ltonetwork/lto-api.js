import {ILTOBasicConfig} from "./interfaces";

export const LTO = "LTO";

export const EVENT_CHAIN_VERSION = 0x40;

export const ADDRESS_VERSION = 0x1;

export const TRANSFER_ATTACHMENT_BYTE_LIMIT = 140;
export const DATA_TX_SIZE_WITHOUT_ENTRIES = 52;
export const DATA_ENTRIES_BYTE_LIMIT: number = 140 * 1024 - DATA_TX_SIZE_WITHOUT_ENTRIES; // 140 kb for the whole tx

export const INITIAL_NONCE = 0;
export const PRIVATE_KEY_LENGTH = 64;
export const PRIVATE_KEY_LENGTH_ECDSA = 32;
export const PUBLIC_KEY_LENGTH = 32;
export const UNCOMPRESSED_PUBLIC_KEY_LENGTH_ECDSA = 65;
export const PUBLIC_KEY_LENGTH_ECDSA = 33;

export const DEFAULT_BASIC_CONFIG: ILTOBasicConfig = {
	requestOffset: 0,
	requestLimit: 100,
	logLevel: "warning",
	minimumSeedLength: 15,
	timeDiff: 0
};

export const MAINNET_BYTE: number = "L".charCodeAt(0);
export const TESTNET_BYTE: number = "T".charCodeAt(0);
export const DEFAULT_MAINNET_NODE = "https://nodes.lto.network";
export const DEFAULT_TESTNET_NODE = "https://testnet.lto.network";

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
  TRANSFER = "transfer",
  LEASE = "lease",
  CANCEL_LEASING = "cancelLeasing",
  MASS_TRANSFER = "massTransfer",
  DATA = "data",
  SET_SCRIPT = "setScript",
  ANCHOR = "anchor",
  INVOKE_ASSOCIATION = "invokeAssociation",
  REVOKE_ASSOCIATION = "revokeAssociation",
  SPONSOR = "sponsor",
  CANCEL_SPONSOR = "cancelSponsor"
}

export const SET_SCRIPT_LANG_VERSION = 1;

export const STUB_NAME = "reservedName";

export const BROADCAST_PATH = "/transactions/broadcast";
