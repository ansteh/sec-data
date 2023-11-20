const MathUtils = require("./math-utils");

const { createMoneyAccount } = require("./money-account");

const createInvestor = ({ universe }) => {
  const moneyAccount = createMoneyAccount({
    baseCurrency: "USD",
    exchangeRatesService: universe.currencyExchange,
  });

  const portfolio = createPortfolio({
    universe,
  });

  const valuation = createPortfolioValuation({
    portfolio,
  });

  const commitTo = async ({ amount, instrument, time }) => {
    const quote = await universe.getQuote(instrument.id, time);
    const value = MathUtils.mul(quote.price, amount);
    const currency = quote.currency;

    const covered = await moneyAccount.hasEnoughBalance({ currency, value });
    if (!covered) {
      throw new Error("NOT_ENOUGH_BALANCE");
    }

    moneyAccount.moveMoney({ currency, time, value });
    portfolio.addInstrument({ amount, instrument, time });
  };

  return {
    commitTo,
  };
};

module.exports = {
  createInvestor,
};
