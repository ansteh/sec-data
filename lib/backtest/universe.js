const createUniverse = ({ provider }) => {
  const getQuote = async (instrumentId, time) => {
    return provider.getQuote(instrumentId, time);
  };

  const getInstruments = async (instrumentIds, time) => {
    return provider.getQuotes(instrumentIds, time);
  };

  const getQuotes = async (instrumentIds, time) => {
    return provider.getQuotes(instrumentIds, time);
  };

  const getCurrencyExchange = () => {
    return provider.currencyExchange;
  };

  return {
    getCurrencyExchange,
    getInstruments,
    getQuote,
    getQuotes,
  };
};

module.exports = {
  createUniverse,
};

console.log("test");
