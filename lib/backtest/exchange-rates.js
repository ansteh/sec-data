const MathUtils = require("./math-utils");

const createCurrencyExchange = () => {
  const exchangeRates = {
    USD: 1,
    EUR: 0.85,
    GBP: 0.75,
    IMG: 0.5,
  };

  const convert = async ({ amount, fromCurrencyCode, toCurrencyCode }) => {
    if (fromCurrencyCode === toCurrencyCode) {
      return amount;
    }

    const [rateFrom, rateTo] = await getExchangeRates([
      fromCurrencyCode,
      toCurrencyCode,
    ]);

    const conversionRatio = MathUtils.div(rateTo, rateFrom);
    const convertedAmount = MathUtils.mul(amount, conversionRatio);

    return convertedAmount;
  };

  const convertByExchangeRates = ({ amount, rateTo, rateFrom }) => {
    if (rateTo === rateFrom) {
      return amount;
    }

    const conversionRatio = MathUtils.div(rateTo, rateFrom);
    const convertedAmount = MathUtils.mul(amount, conversionRatio);

    return convertedAmount;
  };

  const getExchangeRates = async (currencyCodes = [], time) => {
    const rates = currencyCodes.map((code) => {
      return getExchangeRate(code, time);
    });

    return Promise.all(rates);
  };

  const getExchangeRate = async (currencyCode, time) => {
    const rate = exchangeRates[currencyCode];

    if (typeof rate === "undefined") {
      throw new Error("INVALID_CURRENCY_CODE");
    }

    return rate;
  };

  const getExchangeRatesByCurrencyCodes = async (currencyCodes = [], time) => {
    const currencyRates = await getExchangeRates(currencyCodes, time);

    return currencyCodes.reduce((ratesByCurrencyCode, currencyCode, index) => {
      ratesByCurrencyCode[currencyCode] = currencyRates[index];
      return ratesByCurrencyCode;
    }, {});
  };

  return {
    convert,
    convertByExchangeRates,
    getExchangeRate,
    getExchangeRates,
    getExchangeRatesByCurrencyCodes,
  };
};

module.exports = {
  createCurrencyExchange,
};
