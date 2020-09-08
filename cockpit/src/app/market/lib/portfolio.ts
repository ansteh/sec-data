import * as _ from 'lodash';

import * as Commit from './commit';

const add = (a, b) => a + b;
const mul = (a, b) => a * b;

export const createPortfolio = (universe) => {
  const positions = createEntries();
  // const currencies = createCurrencies();

  let cash = 0;

  const addCash = (value = 0) => {
    cash = cash || 0;
    cash += value;
  };

  const getPositions = async () => universe.filterByIds(positions.getKeys());

  const trade = async (id, amount = 0) => {
    const position = positions.get(id) || Commit.createPosition();
    const quote = await universe.getQuote(id);
    Commit.trade(position, quote, amount);
    positions.set(id, position);

    return position;
  };

  // const getImpact = (product, amount = 0) => {
  //   // const quote = universe.getQuote(product);
  //   return mul(universe.getPrice(product), amount);
  // };

  return {
    addCash,
    getPositions,
    trade,
  };
};

const createEntries = () => {
  const entries = {};

  const get = key => entries[key];
  const set = (key, entry) => entries[key] = entry;

  const getKeys = () => { return _.keys(entries) };

  return {
    get,
    set,

    getKeys,
  };
};

const createProductEntries = () => {
  const entries = createEntries();

  const get = product => entries.get(product.id);
  const set = (product, entry) => entries.set(product.id, entry);

  const getKeys = entries.getKeys;

  return {
    get,
    set,

    getKeys,
  };
};

const product = {
  id: 'NYSE:AAPL',
  price: 120,
  currencyCode: 'EUR',
};
