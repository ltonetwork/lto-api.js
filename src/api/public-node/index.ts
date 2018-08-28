import Addresses from './addresses';
import Blocks from './blocks';
import Transactions from './transactions';


export interface INodeAPI {
  addresses: {
    balance(address: string, confirmations?: number): Promise<any>;
    balanceDetails(address: string): Promise<any>;
  },
  blocks: {
    get(signature: string): Promise<any>;
    at(height: number): Promise<any>;
    first(): Promise<any>;
    last(): Promise<any>;
    height(): Promise<any>;
  },
  transactions: {
    get(id: string): Promise<any>;
    getList(address: string): Promise<any>;
    utxSize(): Promise<any>;
    utxGet(id: string): Promise<any>;
    utxGetList(): Promise<any>;
  }
}

export const addresses = Addresses;
export const blocks = Blocks;
export const transactions = Transactions;
