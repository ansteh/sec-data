const MathUtils = require("./math-utils");

const createCurrencyExchange = ({ baseCurrency }) => {
  baseCurrency = baseCurrency || "USD";

  const exchangeRates = {
    USD: 1,
    EUR: 0.85,
    GBP: 0.75,
  };

  const convert = async ({ amount, fromCurrencyCode, toCurrencyCode }) => {
    if (fromCurrencyCode === toCurrencyCode) {
      return amount;
    }

    const [rateFrom, rateTo] = await getRates([
      fromCurrencyCode,
      toCurrencyCode,
    ]);

    const conversionRatio = MathUtils.div(rateTo, rateFrom);
    const convertedAmount = MathUtils.mul(amount, conversionRatio);

    return convertedAmount;
  };

  const getRates = async (currencyCodes = []) => {
    return Promise.all(currencyCodes.map(getRate));
  };

  const getRate = async (currencyCode) => {
    const rate = exchangeRates[currencyCode];

    if (!rate) {
      throw new Error("INVALID_CURRENCY_CODE");
    }

    return rate;
  };

  return {
    convert,
    getRates,
  };
};

module.exports = {
  createCurrencyExchange,
};
