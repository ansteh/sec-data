const _      = require('lodash');

const Stocks      = require('../../stocks.js');
const StockPrice  = require('../../../lib/stock/price/index.js');

const updateAll = (stocks) => {
  let promisedStocks;

  if(stocks){
    promisedStocks = Promise.resolve(stocks);
  } else {
    promisedStocks = Stocks.findLastHistoricals({
      olderThan: { unit: 'days', value: 2 }
    });
  }

  return promisedStocks
    .then(requestAndSaveAllHistoricalsBy)
    .then(() => {
      console.log('All historical prices have been updated!');
    })
    .catch(console.log);
};

const requestAndSaveAllHistoricalsBy = (stocks = []) => {
  if(stocks.length === 0) {
    return Promise.resolve(null);
  } else {
    const stock = _.head(stocks);
    console.log(`Update historicals of ${stock.ticker}! Left ${stocks.length-1}`);

    return requestAndSaveHistoricalsBy(stock)
      .then(() => {
        return requestAndSaveAllHistoricalsBy(_.tail(stocks));
      });
  }
};

const requestAndSaveHistoricalsBy = (stock) => {
  // console.log(stock);
  const ticker = _.get(stock, 'ticker');
  const lastUpdate = _.get(stock, 'historical.date');

  return StockPrice.requestTimeseriesByTickerAndDate(ticker, lastUpdate)
    .then((series) => {
      return Stocks.appendHistoricalPricesBy({ ticker, series });
    })
    .catch((err) => {
      console.log(`Failed to request historical prices for ${ticker}`, err);
    });
};

module.exports = {
  updateAll,
};
