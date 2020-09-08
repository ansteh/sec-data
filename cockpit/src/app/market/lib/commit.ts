import * as _ from 'lodash';

const POSITION = { trade: null, count: 0, invested: 0, net: 0, balance: 0, avgPricePerShare: 0, history: [] };
const PROPERTIES = _.keys(POSITION);

const getAvgPrice = (series) => {
  return _
    .chain(series)
    .map('price')
    .mean()
    .round(2)
    .value()
};

export const long = (position, quote, amount) => {
  position.trade = 'long';

  if(_.isNumber(amount) && _.isNaN(amount) == false && amount !== 0) {
    const value = amount * quote.close;

    position.count += amount;
    position.invested += value;

    position.history.push({ amount, price: quote.close, value, date: quote.date });
  }

  position.avgPricePerShare = getAvgPrice(position.history);
  position.net = position.count * quote.close;
  position.balance = position.net - position.invested;

  return position;
};

export const short = (position, quote, amount) => {
  position.trade = 'short';

  if(_.isNumber(amount) && _.isNaN(amount) == false && amount !== 0) {
    const value = amount * quote.close;

    position.count += amount;
    position.net += value;

    position.history.push({ amount, price: quote.close, value, date: quote.date });
  }

  position.avgPricePerShare = getAvgPrice(position.history);
  position.invested = position.count * quote.close;
  position.balance = position.net - position.invested;

  return position;
};

export const trade = (position, quote, amount) => {
  if(!position.trade) {
    position.trade = amount >= 0 ? 'long' : 'short';
  }

  if(position.trade === 'long') {
    if(amount > 0 || position.count + amount >= 0) {
      long(position, quote, amount);
    } else {
      const adjustedAmount = position.count + amount;
      long(position, quote, -position.count);
      close(position);
      short(_.assign(position, POSITION), quote, adjustedAmount);
    }

    setTotals(position);

    return position;
  }

  if(position.trade === 'short') {
    if(amount < 0 || position.count + amount <= 0) {
      short(position, quote, amount);
    } else {
      const adjustedAmount = position.count + amount;
      short(position, quote, -position.count);
      close(position);
      long(_.assign(position, POSITION), quote, adjustedAmount);
    }

    setTotals(position);

    return position;
  }
};

const close = (position) => {
  const snapshot = _.assign({}, _.pick(position, PROPERTIES));
  position.trades = position.trades || [];
  position.trades.push(snapshot);
};

const setTotals = (position) => {
  position.total = {
    balance: sum('balance', position),
    invested: sum('invested', position),
    net: sum('net', position),
  };
};

const sum = (property, position) => {
  const trades = position.trades || [];
  const values = [position[property] || 0, ...trades.map(trade => trade[property])];

  return _
    .chain(values)
    .sum()
    .round(2)
    .value()
};

export const createPosition = () => {
  return _.clone(POSITION);
};

const audit = (positions) => {
  const [ losers, winners ] = _.partition(positions, (position) => {
    return (_.get(position, 'total.balance') || 0) < 0;
  });

  return {
    count: positions.length,
    losers: losers.length,
    winners: winners.length,

    balance: _.sumBy(positions, 'total.balance'),
    invested: _.sumBy(positions, 'total.invested'),
    net: _.sumBy(positions, 'total.net'),

    // fail: _
    //   .chain(losers)
    //   .sortBy('total.balance')
    //   .first()
    //   .value()
  };
};

// const position = _.cloneDeep(POSITION);
//
// long(position, { close: 5 }, 100);
// console.log(position);
//
// long(position, { close: 5 }, -50);
// console.log(position);
//
// long(position, { close: 6 }, -25);
// console.log(position);
//
// long(position, { close: 2 }, -25);
// console.log(position);

const simulateSellOnLong = (price, amount) => {
  const position = _.cloneDeep(POSITION);

  long(position, { close: _.round(_.random(price.min, price.max), 2) }, amount);
  console.log(position);

  do {
    const move = -_.random(1, amount);

    long(position, { close: _.round(_.random(price.min, price.max), 2) }, move);
    console.log(position);

    amount += move;
  } while (amount > 0);
};

// simulateSellOnLong({ min: 2, max: 6 }, 100);

// export const test = () => {
//   const position = _.cloneDeep(POSITION);
//
//   trade(position, { close: 5 }, 100);
//   console.log(position);
//
//   trade(position, { close: 5 }, -50);
//   console.log(position);
//
//   trade(position, { close: 6 }, -25);
//   console.log(position);
//
//   trade(position, { close: 2 }, -75);
//   console.log(position);
//
//   trade(position, { close: 1 }, -25);
//   console.log(position);
//
//   trade(position, { close: 3 }, 75);
//   console.log(position);
// };

export const test = () => {
  const position = _.cloneDeep(POSITION);

  trade(position, { close: 5 }, -50);
  console.log(position);

  trade(position, { close: 5 }, 100);
  console.log(position);
};
