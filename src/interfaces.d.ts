export type TBuffer = Uint8Array | number[];

export type TLogLevel = 'none' | 'error' | 'warning' | 'info';

export interface IHash<T> {
    [key: string]: T;
}

export interface IKeyPair {
  privateKey?: string,
  publicKey: string
}

export interface IKeyPairBytes {
    privateKey?: Uint8Array;
    publicKey: Uint8Array;
}

export interface ILTOConfig extends ILTOBasicConfig {
  networkByte: number;
  nodeAddress: string;
}

export interface ILTOBasicConfig {
  minimumSeedLength: number;
  requestOffset: number;
  requestLimit: number;
  logLevel: TLogLevel;
  timeDiff: number;
}

// Missing interfaces
declare global {
    interface Window {
        msCrypto?: any;
        Response?: any;
        Promise: PromiseConstructor;
    }
    interface ErrorConstructor {
        captureStackTrace(thisArg: any, func: any): void;
    }
}


// Replacement for --allowJs
declare module '*.js' {
    const content: {
        [key: string]: any;
    };
    export = content;
}
