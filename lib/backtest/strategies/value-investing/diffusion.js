const _ = require("lodash");

const createPortfolioProposal = ({
  securities,
  budget,
  count = 20,
  smooth = true,
}) => {
  let budgetPerStock = budget / Math.min(count, securities.length);

  const portfolio = _.chain(securities)
    .take(count)
    .orderBy(["price"], ["desc"])
    .map((instrument, index) => {
      let amount = _.floor(Math.min(budget, budgetPerStock) / instrument.price);
      if (amount === 0 && budget > instrument.price) {
        amount = 1;
      }

      budget -= amount * instrument.price;

      return { amount, instrument };
    })
    .value();

  if (budget > 0 && portfolio.length > 0) {
    let used = [];

    do {
      const item = _.find(portfolio, (item) => {
        return (
          budget >= item.instrument.price &&
          (smooth ? used.indexOf(item) === -1 : true)
        );
      });

      if (item) {
        const amount = smooth
          ? 1
          : _.floor(Math.min(budget, budgetPerStock) / item.instrument.price);

        item.amount += amount;
        budget -= amount * item.instrument.price;
        used.push(item);
      } else if (used.length > 0) {
        used = [];
      } else {
        break;
      }
    } while (budget > 0);
  }

  return portfolio;
};

module.exports = {
  createPortfolioProposal,
};
