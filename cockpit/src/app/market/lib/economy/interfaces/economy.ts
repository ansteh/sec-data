import { Account, Balance } from './account';
import { Product } from './products';
import { Portfolio } from './portfolio';

export interface Portfolio {
  id: string;
  balance: Balance;
  portfolios: Array<Portfolio>;
};
