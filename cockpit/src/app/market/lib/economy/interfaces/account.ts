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
  id?: number;
  date: Date;
  amount: number;
  price: number;
  value: number;
};

export interface Account {
  readonly id?: string;
  readonly productId?: string;
  readonly balance: Balance;
  readonly history: Array<Transaction>;

  addTransaction(transaction: Transaction): void;
  getBalance(): Balance;
  getHistory(): Array<Transaction>;
};
