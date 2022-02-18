export type TBuffer = Uint8Array | number[];

export type TLogLevel = 'none' | 'error' | 'warning' | 'info';

export interface IHash<T> {
    [key: string]: T;
}

export interface IPublicAccount {
    keyType: string;
    publicKey: string;
}

export interface IKeyPair {
    privateKey?: string;
    publicKey: string;
}

export interface Person {
    name: string
}

export interface Rating {
    subject: Person,
    stars: number
}

export interface IBinary {
    readonly base58: string;
    readonly base64: string;
    readonly hex: string;
    asString(): string;
}

export interface IKeyPairBytes {
    privateKey?: IBinary;
    publicKey: IBinary;
}

export interface ITxJSON {
    type: number;
    [_: string]: any;
}

export interface ITransfer {
    recipient: string;
    amount: number;
}

export interface ILTOBasicConfig {
    minimumSeedLength: number;
    requestOffset: number;
    requestLimit: number;
    logLevel: TLogLevel;
    timeDiff: number;
}

export enum Encoding {
    base58 = 'base58',
    base64 = 'base64',
    hex = 'hex',
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
