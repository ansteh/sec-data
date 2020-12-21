import {
  Account,
  Balance,
  Transaction,
} from './interfaces/account';

export interface Options {
  id?: string;
  productId?: string;
  name?: string;

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
    amount: 0,
  };

  const getBalance = () => {
    return balance;
  };

  const getHistory = (): Array<Transaction> => {
    return history;
  };

  const addTransaction = (transaction): void => {
    this.history.push(transaction);

    balance.date = new Date();
    balance.value += transaction.value;
    balance.amount += transaction.amount;
  };

  return {
    addTransaction,
    getBalance,
    getHistory,
  };
};
