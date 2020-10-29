import * as _ from 'lodash';

const CLOSE = 'close';
const LONG = 'long';
const SHORT = 'short';

const TRADE = { type: null, count: 0, value: null };
const PROPERTIES = _.keys(TRADE);

const createTrade = (trade) => {
  trade = Object.assign(_.clone(TRADE), trade);
  trade.value = trade.count * trade.price;

  return trade;
};

export const long = (amount, price) => {
  if(isValidAmount(amount)) return createTrade({
    type: LONG,
    count: amount,
    price,
  });
};

export const short = (amount, price) => {
  if(isValidAmount(amount)) return createTrade({
    type: SHORT,
    count: amount,
    price,
  });
};

export const close = (price) => {
  return createTrade({
    type: CLOSE,
    count: 0,
    price,
  });
};

const isValidAmount = amount => amount !== 0;

export const trade = (position, amount, price) => {
  if(amount == 0) return position;

  const type = getType(amount);

  if(type === LONG) {
    return splitLong(position, amount, price);
  }

  if(type === SHORT) {
    return splitShort(position, amount, price);
  }
};

export const getType = amount => amount >= 0 ? LONG : SHORT;

const isPositive = value => value >= 0;
const isNegative = value => value < 0;

const isShort = position => isNegative(position.count);
const isLong = position => isPositive(position.count);

const splitLong = (position, amount, price) => {
  const trades = [];

  if(isLong(position)) {
    trades.push(long(amount, price));
  } else {
    const direction = position.count + amount;
    if(isLong({ count: direction })) {
      trades.push(long(-position.count, price));
      trades.push(close(price));

      if(direction > 0) {
        trades.push(long(direction, price));
      }
    } else {
      trades.push(long(amount, price));
    }
  }

  return trades;
};

const splitShort = (position, amount, price) => {
  const trades = [];

  if(isShort(position)) {
    trades.push(short(amount, price));
  } else {
    const direction = position.count + amount;
    if(isShort({ count: direction })) {
      trades.push(short(position.count, price));
      trades.push(close(price));

      if(direction < 0) {
        trades.push(short(direction, price));
      }
    } else {
      trades.push(short(amount, price));
    }
  }

  return trades;
};

export const test = () => {
  const position = _.cloneDeep(TRADE);

  console.log(trade(position, -50, 5));
  // console.log(trade(position, 100, 5));
};
