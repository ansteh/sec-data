const MathUtils = require("./math-utils");

const createPortfolioValuation = ({ portfolio, universe }) => {
  const getSnapshot = async ({ baseCurrency, time }) => {
    const snapshot = await getPortfolioSnapshot({ baseCurrency, time });
    const valuation = valuate(snapshot);

    const state = {
      snapshot,
      time,
      valuation,
    };

    return state;
  };

  const valuate = (snapshot) => {
    return {
      value: MathUtils.addAll(snapshot, "value"),
    };
  };

  const getPortfolioSnapshot = async ({ baseCurrency, time }) => {
    const snapshot = await portfolio.getSnapshot(time);
    const exchangeRates = await getExchangeRatesByCurrencyCodes(time);

    snapshot.forEach((instrument) => {
      instrument.conversion = getCurrencyConversion(instrument, {
        exchangeRates,
        baseCurrency: baseCurrency || "USD",
      });
    });

    return snapshot;
  };

  const getCurrencyConversion = (snapshot, { baseCurrency, exchangeRates }) => {
    const currencyExchange = universe.getCurrencyExchange();
    const valueInBaseCurrency = currencyExchange.convertByExchangeRates({
      amount: snapshot.value,
      rateFrom: exchangeRates[snapshot.quote.currency],
      rateTo: exchangeRates[baseCurrency],
    });

    return {
      currency: baseCurrency,
      value: valueInBaseCurrency,
    };
  };

  const getExchangeRatesByCurrencyCodes = async (time) => {
    const exchange = universe.getCurrencyExchange();
    const currencyCodes = portfolio.getCurrencyCodes();

    return exchange.getExchangeRatesByCurrencyCodes(currencyCodes, time);
  };

  return {
    getSnapshot,
  };
};

module.exports = {
  createPortfolioValuation,
};
