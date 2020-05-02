import * as _ from 'lodash';

export const create = ({ candidates, budget, count = 20, smooth = true }) => {
  let budgetPerStock = budget/count;

  // console.log('starting budget', budget);
  // console.log('budgetPerStock', budgetPerStock);

  console.log('candidates', candidates);
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
}
