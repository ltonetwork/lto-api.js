export type IPair<T> = {
  key: T;
  value: T;
};

export interface ITxJSON extends Record<string, any> {
  type: number;
}

export interface ITransfer {
  recipient: string;
  amount: number;
}
