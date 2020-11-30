import { Account, Balance } from './account';
import { Product } from './products';

export interface Portfolio {
  id: string;
  balance: Balance;
  accounts: Array<Account>;
  products: Array<Product>;
};
