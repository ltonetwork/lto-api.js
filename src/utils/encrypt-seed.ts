import * as AES from 'crypto-js/aes.js';
import { sha256 } from '@noble/hashes/sha256';
import { bytesToHex, hexToBytes } from '@noble/hashes/utils';
import { SEED_ENCRYPTION_ROUNDS } from '../constants';

function strengthenPassword(password: string, rounds = SEED_ENCRYPTION_ROUNDS): string {
  while (rounds--) password = bytesToHex(sha256(password));
  return password;
}

export function encryptSeed(seed: string, password: string, encryptionRounds?: number): string {
  if (!seed || typeof seed !== 'string') throw new Error('Seed is required');

  if (!password || typeof password !== 'string') throw new Error('Password is required');

  password = strengthenPassword(password, encryptionRounds);

  return AES.encrypt(seed, password).toString();
}

export function decryptSeed(encryptedSeed: string, password: string, encryptionRounds?: number): string {
  if (!encryptedSeed || typeof encryptedSeed !== 'string') throw new Error('Encrypted seed is required');

  if (!password || typeof password !== 'string') throw new Error('Password is required');

  password = strengthenPassword(password, encryptionRounds);
  const hexSeed = AES.decrypt(encryptedSeed, password);

  return new TextDecoder().decode(hexToBytes(hexSeed.toString()));
}
