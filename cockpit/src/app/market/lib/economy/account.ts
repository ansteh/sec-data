import {
  Account,
  Balance,
  Transaction,
} from './interfaces/account';

export interface Options {
  id?: string;
  productId?: string;
  name: string;

  balance?: Balance;
  history?: Array<Transaction>;
};

export const createAccount = ({
  id,
  productId,
  name,
  balance,
  history,
}: Options): Account => {
  history = history || [];
  balance = balance || {
    date: new Date(),
    value: 0,
  };

  const getBalance = () => {
    return balance;
  };

  const getHistory = () => {
    return history;
  };

  const addTransaction = (transaction) => {
    this.history.push(transaction);

    balance.date = new Date();
    balance.value += transaction.value;
  };

  return {
    addTransaction,
    getBalance,
    getHistory,
  };
};
