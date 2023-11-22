const MathUtils = require("./math-utils");

const createCurrencyExchange = ({ baseCurrency }) => {
  baseCurrency = baseCurrency || "USD";

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

  const getExchangeRates = async (currencyCodes = []) => {
    return Promise.all(currencyCodes.map(getExchangeRate));
  };

  const getExchangeRate = async (currencyCode) => {
    const rate = exchangeRates[currencyCode];

    if (!rate) {
      throw new Error("INVALID_CURRENCY_CODE");
    }

    return rate;
  };

  const getExchangeRatesByCurrencyCodes = async (currencyCodes = []) => {
    const currencyRates = await getExchangeRates(currencyCodes);

    return currencyCodes.reduce((ratesByCurrencyCode, currencyCode, index) => {
      ratesByCurrencyCode[currencyCode] = currencyRates[index];
      return ratesByCurrencyCode;
    }, {});
  };

  return {
    convert,
    convertByExchangeRates,
    getExchangeRates,
    getExchangeRatesByCurrencyCodes,
  };
};

module.exports = {
  createCurrencyExchange,
};
