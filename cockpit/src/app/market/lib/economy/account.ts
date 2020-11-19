// # Account (for product)
//   - id
//   - productId ?
//   - history
//   - balance

export interface Balance {
  date: Date;
  value: number;
};

export interface Transaction {
  date: Date;
  amount: number;
  price: number;
  value: number;
};

export interface Account {
  readonly id?: string;
  readonly balance: Balance;
  readonly history: Array<Transaction>;

  getBalance(): any;
  getHistory(): any;
};
