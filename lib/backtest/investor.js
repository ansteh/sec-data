const MathUtils = require("./math-utils");

const { createMoneyAccount } = require("./money-account");
const { createPortfolio } = require("./portfolio");
const { createPortfolioValuation } = require("./portfolio-valuation");

const createInvestor = ({ strategy, universe }) => {
  const moneyAccount = createMoneyAccount({
    baseCurrency: "USD",
    currencyExchange: universe.getCurrencyExchange(),
  });

  const portfolio = createPortfolio({
    universe,
  });

  const valuation = createPortfolioValuation({
    portfolio,
    universe,
  });

  const deposit = async ({ currency, time, value }) => {
    if (value < 0) {
      throw new Error("INVALID_VALUE_FOR_INVESTOR_DEPOSIT");
    }

    return moneyAccount.moveMoney({ currency, time, value });
  };

  const trade = async ({ amount, instrument, time }) => {
    const quote = await universe.getQuote(instrument.id, time);
    const value = MathUtils.mul(quote.price, amount);
    const currency = quote.currency;

    const covered = await moneyAccount.hasEnoughBalance({ currency, value });
    if (!covered) {
      throw new Error("NOT_ENOUGH_BALANCE");
    }

    await moneyAccount.moveMoney({ currency, time, value: -value });
    await portfolio.addInstrument({ amount, instrument, time });
  };

  const getTotalAmountOfMoneyAccount = async (currency) => {
    return moneyAccount.getTotalAmount(currency);
  };

  // const getSnapshot = async (time) => {
  //   const snapshot = await valuation.getSnapshot(time);
  // };

  return {
    deposit,
    getTotalAmountOfMoneyAccount,
    trade,
  };
};

module.exports = {
  createInvestor,
};
