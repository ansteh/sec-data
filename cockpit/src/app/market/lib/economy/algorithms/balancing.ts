export type Position = {
  id: number | string;
  amount: number;
  price: number;
  value?: number;
  weight?: number;
};

export type Order = {
  id: number | string;
  amount: number;
};

export interface BalancingOptions {
  budget?: number;
  maxWeight?: number;
}

// export const balance = (
//   positions: Position[],
//   options: BalancingOptions
// ): Position[] => {
//   positions.forEach((position) => {
//     position.value = position.amount * position.price
//   });
//
//   const totalValue = positions.reduce((sum, position) => {
//     return sum + position.value;
//   }, options.budget || 0);
//
//   positions.forEach((position) => {
//     position.weight = position.value / totalValue;
//   });
//
//
// };
//
// export const balance = (
//   maxWeight: number,
//   position: Position
// ): Order => {
//
// };

import * as _ from "lodash";

const createPortfolioManager = ({ filter, rebalance }) => {
  const trades = [];

  const propose = async (securities) => {
    return rebalance({
      securities: filter(securities),
      budget: 100000,
    });
  };

  return {
    propose,
  };
};

// should be not here: count, budget, budgetPerStock
const filterSecurities = (candidates) => {
  // console.log('candidates', candidates);

  return (
    _.chain(candidates)
      // .orderBy(['valuation.score'], ['desc'])
      // .orderBy(['fcf_mos'], ['desc'])
      // .orderBy(getEstimate, ['desc'])
      .orderBy(["price"], ["desc"])
      // .orderBy(['marginOfSafety'], ['desc'])
      .value()
  );
};

export const createPortfolio = ({
  securities,
  budget,
  count = 20,
  smooth = true,
}) => {
  let budgetPerStock = budget / count;

  const portfolio = _.chain(securities)
    .take(count)
    .orderBy(["price"], ["desc"])
    .map((stock, index) => {
      let amount = _.floor(Math.min(budget, budgetPerStock) / stock.price);
      if (amount === 0 && budget > stock.price) amount = 1;
      budget -= amount * stock.price;

      return { count: amount, stock };
    })
    .value();

  // console.log('starting budget', budget);
  // console.log('budgetPerStock', budgetPerStock);

  if (budget > 0 && portfolio.length > 0) {
    let used = [];

    do {
      const stock = _.find(portfolio, (item) => {
        return (
          budget > item.stock.price &&
          (smooth ? used.indexOf(item) === -1 : true)
        );
      });

      if (stock) {
        const amount = smooth
          ? 1
          : _.floor(Math.min(budget, budgetPerStock) / stock.stock.price);
        // console.log('add to ', stock, amount);
        stock.count += amount;
        budget -= amount * stock.stock.price;
        used.push(stock);
      } else if (used.length > 0) {
        used = [];
      } else {
        break;
      }
    } while (budget > 0);
  }

  return portfolio;
};

export const getOrders = ({ current, target }) => {
  console.log("orders current", current);
  console.log("orders target", target);

  const stocks = {
    current: _.keyBy(current.positions, "ticker"),
    target: _.keyBy(target.positions, "ticker"),
  };

  const tickers = _.chain(_.keys(stocks.current).concat(_.keys(stocks.target)))
    .uniq()
    .filter()
    .sort()
    .value();

  // console.log('tickers', tickers);

  const orders = _.chain(tickers)
    .map((ticker) => {
      const current = _.get(stocks, ["current", ticker]);
      const target = _.get(stocks, ["target", ticker]);

      const price = _.get(target, "price") || _.get(current, "price");
      const change = _.get(target, "count", 0) - _.get(current, "count", 0);

      return {
        ticker,
        count: _.get(target, "count", 0),
        change,
        // fee: 0.5 + (Math.abs(change) * price * 0.01),
        fee: 0.5 + Math.abs(change) * 0.004,
      };
    })
    .filter((order) => order.change !== 0)
    .value();

  return {
    fee: _.sumBy(orders, "fee"),
    orders,
  };
};
