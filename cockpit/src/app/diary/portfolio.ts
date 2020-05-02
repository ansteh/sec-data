import * as _ from 'lodash';

export const create = ({ candidates, budget, count = 20 }) => {
  let budgetPerStock = budget/count;

  // console.log('starting budget', budget);
  // console.log('budgetPerStock', budgetPerStock);

  const portfolio = _
    .chain(candidates)
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

  if(budget > 0) {
    do {
      const stock = _.find(portfolio, item => budget > item.stock.price);

      if(stock) {
        const amount = _.floor(Math.min(budget, budgetPerStock)/stock.stock.price);
        // console.log('add to ', stock, amount);
        stock.count += amount;
        budget -= amount * stock.stock.price;
      } else {
        break;
      }

    } while(budget > 0);
  }

  return portfolio;
}
