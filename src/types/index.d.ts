export * from './accounts';
export * from './binary';
export * from './events';
export * from './identities';
export * from './messages';
export * from './transactions';

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
