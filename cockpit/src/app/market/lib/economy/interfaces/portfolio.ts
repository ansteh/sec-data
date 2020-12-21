import { Account, Balance, Transaction } from './account';
import { Product } from './products';

export interface Portfolio {
  id?: string | number;
  // balance: Balance;
  // accounts: Array<Account>;
  // products: Array<Product>;
  
  getId(): string | number;
  addTransaction(productId: string, transaction: Transaction): void;
  getBalance(): Balance;
  getHistory(): Array<Transaction>;
};
