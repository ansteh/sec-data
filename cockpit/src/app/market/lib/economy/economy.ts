import {
  Account,
  Balance,
  Transaction,
} from './interfaces/account';

import {
  Product,
} from './interfaces/products';

import {
  Portfolio
} from './interfaces/portfolio';

export interface Economy {
  // balance: Balance;
  // // markets: Array<Market>;
  // portfolios: Array<Portfolio>;
  // products: Array<Product>;
};

export interface EconomyState {
  balance?: Balance;
  // markets?: Array<Market>;
  portfolios?: Array<Portfolio>;
  products: Array<Product>;
};

import { createPortfolio } from './portfolio';

export const createEconomy = ({
  balance,
  // markets,
  portfolios,
  products,
}: EconomyState): Economy => {
  balance = balance || { date: new Date(), value: 0, amount: 0 };
  // markets = markets || [];
  portfolios = portfolios || [];
  
  const addTransaction = (portfolioId, productId, transaction) => {
    const portfolio = findOrCreatePortfolio(portfolioId);
    portfolio.addTransaction(productId, transaction);
    addToBalance(transaction);
  };
  
  const findOrCreatePortfolio = (id: string): Portfolio => {
    let portfolio = portfolios.find(portfolio => portfolio.getId() === id);

    if(!portfolio) {
      portfolio = createPortfolio({ id });
      portfolios.push(portfolio);
    }

    return portfolio;
  };
  
  const addToBalance = (transaction: Transaction) => {
    balance.date = new Date();
    balance.value += transaction.value;
    balance.amount += transaction.amount;
  };
  
  return {
    addTransaction,
  };
};