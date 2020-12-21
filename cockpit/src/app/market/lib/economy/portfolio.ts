import {
  Account,
  Balance,
  Transaction,
} from './interfaces/account';

import {
  Portfolio
} from './interfaces/portfolio';

export interface PortfolioOptions {
  id?: string;
  name?: string;
  accounts?: Array<Account>;
  balance?: Balance;
};

import { createAccount } from './account';

const flatten = (collection: Array<Array<any>>): Array<any>=> {
  const items = [];

  (collection || []).forEach((subItems) => {
    subItems.forEach(item => items.push(item));
  });

  return items;
};

export const createPortfolio = ({
  id,
  name,
  accounts,
  balance,
}: PortfolioOptions): Portfolio => {
  accounts = accounts || [];
  balance = balance || { date: new Date(), value: 0, amount: 0 };
  
  const getId = () => {
    return id;
  };
  
  const getBalance = () => {
    return balance;
  };

  const getHistory = (): Array<Transaction> => {
    let transactions = (accounts || [])
      .map(account => account.getHistory());

    return flatten(transactions)
      .sort(transaction => transaction.date);
  };

  const addTransaction = (productId, transaction) => {
    const account = findOrCreateAccount(productId);
    account.addTransaction(transaction);
    addToBalance(transaction);
  };

  const findOrCreateAccount = (productId): Account => {
    let account = accounts.find(account => account.productId === productId);

    if(!account) {
      account = createAccount({ productId });
      accounts.push(account);
    }

    return account;
  };

  const addToBalance = (transaction: Transaction) => {
    balance.date = new Date();
    balance.value += transaction.value;
    balance.amount += transaction.amount;
  };

  return {
    getId,
    addTransaction,
    getBalance,
    getHistory,
  };
};
