const _ = require("lodash");

const MathUtils = require("../../math-utils");

const createPortfolioProposal = ({
  securities,
  budget,
  count = 20,
  smooth = true,
}) => {
  let budgetPerStock = MathUtils.div(
    budget,
    Math.min(count, securities.length)
  );

  const portfolio = _.chain(securities)
    .take(count)
    .orderBy(["price"], ["desc"])
    .map((instrument, index) => {
      let amount = _.floor(
        MathUtils.div(Math.min(budget, budgetPerStock), instrument.price)
      );

      if (amount === 0 && budget >= instrument.price) {
        amount = 1;
      }

      if (amount > 0) {
        budget = MathUtils.sub(budget, MathUtils.mul(amount, instrument.price));
      }

      return { amount, instrument };
    })
    .value();

  if (budget > 0 && portfolio.length > 0) {
    let used = [];

    do {
      const item = _.find(portfolio, (item) => {
        return (
          (smooth ? used.indexOf(item) === -1 : true) &&
          budget >= item.instrument.price
        );
      });

      if (item) {
        let amount = 0;
        if (smooth) {
          amount = 1;
        } else {
          amount = _.floor(
            MathUtils.div(
              Math.min(budget, budgetPerStock),
              item.instrument.price
            )
          );
        }

        budget = MathUtils.sub(
          budget,
          MathUtils.mul(amount, item.instrument.price)
        );

        item.amount += amount;
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
