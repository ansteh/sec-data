const { createCurrencyExchange } = require("../exchange-rates");

const nasdaq = {};

nasdaq.currencyExchange = createCurrencyExchange({
  baseCurrency: "USD",
});

const tickers = {
  AAPL: {
    id: 1,
    ticker: "AAPL",
    currency: "USD",
  },
};

nasdaq.getTicker = async (ticker) => {
  return tickers[ticker];
};

nasdaq.getQuote = async (instrumentId, time) => {
  return {
    instrumentId,
    currency: "USD",
    price: 10,
    date: time || new Date(),
  };
};

nasdaq.getQuotes = async (instrumentIds, time) => {
  const quotes = {};

  const queues = instrumentIds.map(async (instrumentId) => {
    quotes[instrumentId] = await nasdaq.getQuote(instrumentId, time);
  });

  await Promise.all(queues);

  return quotes;
};

module.exports = nasdaq;