import { Account, Balance } from './account';
import { Product } from './products';

export interface Portfolio {
  id: string;
  balance: Balance;
  accounts: Array<Account>;
  // products: Array<Product>;

  addTransaction(productId: string, transaction: Transaction): void;
  getBalance(): Balance;
  getHistory(): Array<Transaction>;
};
