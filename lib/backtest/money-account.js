const MathUtils = require("./math-utils");

const createMoneyAccount = ({ baseCurrency, exchangeRatesService }) => {
  baseCurrency = baseCurrency || "USD";

  let currencies = {};
  let totalValue = 0;

  const moveMoney = async ({ currency, time, value }) => {
    const account = currencies[currency] || {
      currency,
      value: 0,
      movements: [],
    };

    account.value = MathUtils.add(account.value, value || 0);
    account.movements.push({
      change: value || 0,
      result: account.value,
      time: time || new Date(),
    });

    currencies[currency] = account;

    await updateToalValue();

    return account;
  };

  const updateToalValue = async () => {
    const exchangeRates = await getExchangeRatesByCurrencyCodes();

    totalValue = Object.values(currencies).reduce((total, account) => {
      const valueInBaseCurrency = exchangeRatesService.convertByExchangeRates({
        amount: account.value,
        rateFrom: exchangeRates[account.currency],
        rateTo: exchangeRates[baseCurrency],
      });

      return MathUtils.add(total, valueInBaseCurrency);
    }, 0);
  };

  const getExchangeRatesByCurrencyCodes = async () => {
    const currencyCodes = Object.keys(currencies);
    currencyCodes.push(baseCurrency);

    return exchangeRatesService.getExchangeRatesByCurrencyCodes(currencyCodes);
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
