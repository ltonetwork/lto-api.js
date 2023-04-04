import { Counter, ModeOfOperation } from 'aes-js';
import { sha256 } from '@noble/hashes/sha256';

function strengthenPassword(password: string | Uint8Array, rounds = 5000): Uint8Array {
  let data = password;
  while (rounds--) {
    data = sha256(data);
  }
  return typeof data === 'string' ? new TextEncoder().encode(data) : data;
}

export function encrypt(data: Uint8Array, password: string | Uint8Array, rounds?: number): Uint8Array {
  const strengthenedPassword = strengthenPassword(password, rounds);

  const key = strengthenedPassword;
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const aesCtr = new ModeOfOperation.ctr(key, new Counter(iv));
  const encryptedBytes = aesCtr.encrypt(data);

  const ivAndEncrypted = new Uint8Array(iv.length + encryptedBytes.length);
  ivAndEncrypted.set(iv);
  ivAndEncrypted.set(encryptedBytes, iv.length);

  return ivAndEncrypted;
}

export function decrypt(encrypted: Uint8Array, password: string, rounds?: number): Uint8Array {
  const strengthenedPassword = strengthenPassword(password, rounds);

  const key = strengthenedPassword;
  const iv = encrypted.slice(0, 12);
  const encryptedBuffer = encrypted.slice(12);

  const aesCtr = new ModeOfOperation.ctr(key, new Counter(iv));
  const decryptedBytes = aesCtr.decrypt(encryptedBuffer);

  return decryptedBytes;
}
