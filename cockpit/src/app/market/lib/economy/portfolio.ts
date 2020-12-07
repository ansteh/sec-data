import {
  Account,
  Balance,
  Transaction,
} from './interfaces/account';

import {
  Portfolio
} from './interfaces/portfolio';

export interface Options {
  id?: string;
  name: string;
  accounts?: Array<Account>;
  balance?: Balance;
};

import { createAccount } from './account';

export const createPortfolio = ({
  id,
  name,
  accounts,
  balance,
  history,
}: Options): Account => {
  accounts = accounts || [];
  balance = balance || { date: new Date(), value: 0 };
  history = history || [];

  const getBalance = () => {
    return balance;
  };

  const getHistory = () => {
    return (accounts || [])
      .map(account => account.getHistory())
      .sort(transaction => transaction.date);
  };

  const addTransaction = (productId, transaction) => {
    const account = findOrCreateAccount(productId);
    account.addTransaction(transaction);
    addToBalance(transaction.value);
  };

  const findOrCreateAccount = (productId): Account => {
    let account = accounts.find(account => account.productId === productId);

    if(!account) {
      account = createAccount({ productId });
      accounts.addAccount(account);
    }

    return account;
  };

  const addToBalance = (value: number) => {
    balance.date = new Date();
    balance.value += value;
  };

  return {
    addTransaction,
    getBalance,
    getHistory,
  };
};
