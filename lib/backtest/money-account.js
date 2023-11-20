const MathUtils = require("./math-utils");

const createMoneyAccount = ({ baseCurrency, exchangeRatesService }) => {
  baseCurrency = baseCurrency || "USD";

  let currencies = {};
  let totalValue = 0;

  const moveMoney = async ({ curreny, time, value }) => {
    const account = currencies[curreny] || {
      curreny,
      value: 0,
      movements: [],
    };

    account.value = MathUtils.add(account.value, value || 0);
    account.movements.push({
      change: value || 0,
      result: account.value,
      time: time || new Date(),
    });

    currencies[curreny] = account;

    return account;
  };

  const getTotalAmount = async (currency = baseCurrency) => {
    return {
      currency,
      value: await convertCurrency(totalValue, currency),
    };
  };

  const convertCurrency = async (amount, currency) => {
    return exchangeRatesService.convert({
      amount,
      fromCurrencyCode: baseCurrency,
      toCurrencyCode: currency,
    });
  };

  const hasEnoughBalance = async ({ currency, value }) => {
    if (value <= 0) {
      return true;
    }

    throw new Error("TODO: hasEnoughBalance");
  };

  return {
    getTotalAmount,
    moveMoney,
  };
};

module.exports = {
  createMoneyAccount,
};
