import * as _ from 'lodash';

export const create = ({ candidates, budget, count = 20, smooth = true }) => {
  let budgetPerStock = budget/count;

  // console.log('candidates', candidates);
  // console.log('starting budget', budget);
  // console.log('budgetPerStock', budgetPerStock);

  const portfolio = _
    .chain(candidates)
    // .orderBy(['valuation.score'], ['desc'])
    // .orderBy(['fcf_mos'], ['desc'])
    // .orderBy(getEstimate, ['desc'])
    .take(count)
    .orderBy(['price'], ['desc'])
    .map((stock, index) => {
      let amount = _.floor(Math.min(budget, budgetPerStock)/stock.price);
      if(amount === 0 && budget > stock.price) amount = 1;
      budget -= amount * stock.price;

      return { count: amount, stock };
    })
    .orderBy(['marginOfSafety'], ['desc'])
    .value();

  if(budget > 0 && portfolio.length > 0) {
    let used = [];

    do {
      const stock = _.find(portfolio, (item) => {
        return budget > item.stock.price
          && (smooth ? used.indexOf(item) === -1 : true);
      });

      if(stock) {
        const amount = smooth ? 1 : _.floor(Math.min(budget, budgetPerStock)/stock.stock.price);
        // console.log('add to ', stock, amount);
        stock.count += amount;
        budget -= amount * stock.stock.price;
        used.push(stock);
      } else if(used.length > 0) {
        used = [];
      } else {
        break;
      }

    } while(budget > 0);
  }

  return portfolio;
};

const getEstimate = (candidate) => {
  const margin = _.get(candidate, 'fcf_mos') || 0;
  const score = _.get(candidate, 'valuation.score') || 0;
  // console.log({ margin, score });

  return margin * 0.3 + score/50*0.7;
};

export const getOrders = ({ current, target }) => {
  // console.log('orders current', current);
  // console.log('orders target', target);

  const stocks = {
    current: _.keyBy(current.positions, 'ticker'),
    target: _.keyBy(target.positions, 'ticker'),
  };

  const tickers = _
    .chain(_.keys(stocks.current).concat(_.keys(stocks.target)))
    .uniq()
    .filter()
    .sort()
    .value();

  // console.log('tickers', tickers);

  const orders = _
    .chain(tickers)
    .map((ticker) => {
      const current = _.get(stocks, ['current', ticker]);
      const target = _.get(stocks, ['target', ticker]);
      
      const count = _.get(target, 'count', 0);
      const price = _.get(target, 'price') || _.get(current, 'price');
      const change = _.get(target, 'count', 0) - _.get(current, 'count', 0);

      return {
        ticker,
        count,
        price,
        change,
        // fee: 0.5 + (Math.abs(change) * price * 0.01),
        fee: (change != 0) ? 0.5 + (Math.abs(change) * 0.004) : 0,
      };
    })
    .filter(order => order.change !== 0)
    .value();

  return {
    fee: _.sumBy(orders, 'fee'),
    orders,
  };
};
