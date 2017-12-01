const moment  = require('moment');
const _       = require('lodash');

const Service      = require('./service');
const StockService = require('../service.js');
const Model        = require('./model');

const {
  historical
} = require('google-finance');

const save = (ticker) => {
  let current;

  if(ticker === 'GME') {
    current = 'NYSE:GME';
  }

  // console.log(current);

  const options = {
    symbol: current || ticker,
    from: '2006-01-01',
    to: moment().format('YYYY-MM-DD')
  };

  // console.log(options);

  return historical(options)
  .then((data) => {
    return Service.save(ticker, data);
  })
};

const getModel = (ticker) => {
  return Service.get(ticker)
    .then(Model.StockPrices)
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

const getAllAsModels = (tickers) => {
  return Service.getAll(tickers)
    .then((historicals) => {
      _.forOwn(historicals, ({ historical }, ticker) => {
        _.set(historicals[ticker], 'historical', Model.StockPrices(historical));
      });

      return historicals;
    });
};

module.exports = {
  getModel,
  getAllAsModels,
  historical,
  prepareAndSaveAll,
  save,
};
