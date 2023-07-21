import LTO from './LTO';
export { LTO };
export { default as Binary } from './Binary';

export * from './accounts';
export * from './errors';
export * from './events';
export * from './identities';
export * from './messages';
export * from './node';
export * from './transactions';
export * from './utils';

export function connect(networkId?: string): LTO {
  return new LTO(networkId);
}
