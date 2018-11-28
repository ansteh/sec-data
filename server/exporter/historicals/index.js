const _      = require('lodash');
const moment = require('moment');

const Stock       = require('../../api/stock/model.js');
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

const removeDateStringsFromHistoricalsOfAllTickers = (stocks) => {
  let promisedStocks;

  if(stocks){
    promisedStocks = Promise.resolve(stocks);
  } else {
    promisedStocks = Stocks.findAllTickers();
  }

  return promisedStocks
    .then(removeDateStringsFromHistoricalsOf)
    .then(() => {
      console.log('All historicals have been cleared from date strings!');
    })
    .catch(console.log);
};

const removeDateStringsFromHistoricalsOf = (stocks = []) => {
  if(stocks.length === 0) {
    return Promise.resolve(null);
  } else {
    const stock = _.head(stocks);
    console.log(`Remove date strings from historicals of ${stock.ticker}! Left ${stocks.length-1}`);

    return removeDateStringsFromHistoricals(stock)
      .then(() => {
        return removeDateStringsFromHistoricalsOf(_.tail(stocks));
      })
  }
};

const removeDateStringsFromHistoricals = (stock) => {
  const ticker = _.get(stock, 'ticker');

  return Stock.getHistoricals(stock.ticker)
    .then(historicals => _.filter(historicals, entry => _.isString(entry.date)))
    .then(invalids => _.map(invalids, 'date'))
    .then((dates) => {
      console.log(`Removing ${dates.length} date strings from historicals of ${stock.ticker}!`);
      return Stocks.removeHistoricalPricesByDateStrings({ ticker, dates });
    })
};

const removeDuplicatesFromHistoricalsOfAllTickers = (stocks) => {
  let promisedStocks;

  if(stocks){
    promisedStocks = Promise.resolve(stocks);
  } else {
    promisedStocks = Stocks.findAllTickers();
  }

  return promisedStocks
    .then(stocks => _.map(stocks, 'ticker'))
    .then(removeDuplicatesFromHistoricalsOf)
    .then(() => {
      console.log('All historical DUPLICATES have been removed!');
    })
    .catch(console.log);
};

const removeDuplicatesFromHistoricalsOf = (tickers = []) => {
  if(tickers.length === 0) {
    return Promise.resolve(null);
  } else {
    const ticker = _.head(tickers);
    console.log(`Remove duplicates from historicals of ${ticker}! Left ${tickers.length-1}`);

    return removeDuplicatesFromHistoricals(ticker)
      .then(() => {
        return removeDuplicatesFromHistoricalsOf(_.tail(tickers));
      })
  }
};

const removeDuplicatesFromHistoricals = (ticker) => {
  return Stock.getHistoricals(ticker)
    .then((historicals) => {
      let lastDate;
      return _
        .chain(historicals)
        .filter(x => x)
        .reduce((duplicates, { date }, index) => {
          const current = moment(date).clone().startOf('day');

          if(lastDate && lastDate.isSame(current)) {
            duplicates.push({ date, index });
          }

          lastDate = current;

          return duplicates;
        }, [])
        .value();
    })
    .then((duplicates) => {
      const indices = _.map(duplicates, 'index');
      return Stocks.removeQuotesFromStockByIndices({ ticker, indices });
    });
};

module.exports = {
  removeDateStringsFromHistoricalsOfAllTickers,
  removeDateStringsFromHistoricals,

  removeDuplicatesFromHistoricalsOfAllTickers,
  removeDuplicatesFromHistoricals,

  updateAll,
};
