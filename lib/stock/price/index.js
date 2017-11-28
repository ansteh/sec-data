const moment  = require('moment');
const _       = require('lodash');

const Service      = require('./service');
const StockService = require('../service.js');

const {
  historical
} = require('google-finance');

const save = (ticker) => {
  return historical({
    symbol: ticker,
    from: '2006-01-01',
    to: moment().format('YYYY-MM-DD')
  })
  .then((data) => {
    return Service.save(ticker, data);
  })
};

const prepareAndSaveAll = (tickers) => {
  let promisedTickers;

  if(tickers){
    promisedTickers = Promise.resolve(tickers);
  } else {
    promisedTickers = StockService.getStocksFromResources()
      .then(_.keys);
  }

  return promisedTickers
    .then(prepareAndSaveTickers)
    .then(() => {
      console.log('all summaries created!');
    })
    .catch(console.log);
};

const prepareAndSaveTickers = (tickers = []) => {
  if(tickers.length === 0) {
    return Promise.resolve(null);
  } else {
    const ticker = _.head(tickers);
    console.log(`prepare ${ticker} summary! Left ${tickers.length-1}`);

    return save(ticker)
      .then(() => {
        return prepareAndSaveTickers(_.tail(tickers));
      });
  }
};

module.exports = {
  historical,
  prepareAndSaveAll,
  save,
};
