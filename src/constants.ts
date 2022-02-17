import {ILTOBasicConfig} from "./../interfaces";

export const LTO = "LTO";

export const EVENT_CHAIN_VERSION = 0x40;

export const ADDRESS_VERSION = 0x1;

export const TRANSFER_ATTACHMENT_BYTE_LIMIT = 140;
export const DATA_TX_SIZE_WITHOUT_ENTRIES = 52;
export const DATA_ENTRIES_BYTE_LIMIT: number = 140 * 1024 - DATA_TX_SIZE_WITHOUT_ENTRIES; // 140 kb for the whole tx

export const INITIAL_NONCE = 0;
export const PUBLIC_KEY_LENGTH = 32;
export const UNCOMPRESSED_PUBLIC_KEY_LENGTH_ECDSA = 65;
export const PUBLIC_KEY_LENGTH_ECDSA = 33;

export const DEFAULT_CONFIG: ILTOBasicConfig = {
	requestOffset: 0,
	requestLimit: 100,
	logLevel: "warning",
	minimumSeedLength: 15,
	timeDiff: 0
};

export const DEFAULT_MAINNET_NODE = "https://nodes.lto.network";
export const DEFAULT_TESTNET_NODE = "https://testnet.lto.network";
