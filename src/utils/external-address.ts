import { keccak_256 } from '@noble/hashes/sha3';
import { sha256 } from '@noble/hashes/sha256';
import { base64 } from '@scure/base';
import { ripemd160 } from '@noble/hashes/ripemd160';
import { bech32 } from 'bech32';
import { decompressPublicKey } from './ecdsa';
import { bytesToHex } from '@noble/hashes/utils';

export function ethereumAddress(publicKey: Uint8Array, chainId?: number | string): string {
  publicKey = decompressPublicKey(publicKey).slice(1);

  const rawAddress = keccak_256(publicKey).slice(-20);
  const address = bytesToHex(rawAddress);

  if (typeof chainId === 'string') chainId = parseInt(chainId);
  const prefix = chainId ? `0x${chainId.toString(16)}00` : '0x';

  return prefix + address;
}

function solanaPrefixByte(network: string): number {
  switch (network) {
    case undefined:
    case 'mainnet-beta':
    case '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp':
      return 0x01;
    case 'testnet':
    case '4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z':
      return 0x02;
    case 'devnet':
    case 'EtWTRABZaYq6iMfeYKouRu166VU2xqa1':
      return 0x03;
    default:
      throw new Error(`Unknown Solana network: ${network}`);
  }
}

export function solanaAddress(publicKey: Uint8Array, network: string): string {
  const prefixByte = solanaPrefixByte(network);
  const buffer = new Uint8Array([prefixByte, ...publicKey]);
  const hash = sha256(buffer);
  const addressBytes = hash.slice(0, 20);
  return base64.encode(new Uint8Array([prefixByte, ...addressBytes]));
}

export function cosmosAddress(publicKey: Uint8Array): string {
  const hash = ripemd160(sha256(new Uint8Array(publicKey)));
  return bech32.encode('cosmos', bech32.toWords(hash));
}
