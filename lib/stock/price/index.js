const moment  = require('moment');
const _       = require('lodash');
const fs      = require('fs-extra');

const Service      = require('./service');
const StockService = require('../service.js');
const Model        = require('./model');

const DEFAULT_FROM_DATE = '2006-01-01';

const { historical } = require('google-finance');
const iex = require('./iex');

const getTimeseries = (options, source = 'IEX') => {
  if(source === 'IEX') {
    return iex.getTimeseries(options);
  }

  return historical(options);
};

const save = (ticker) => {
  let current;

  if(ticker === 'GME') {
    current = 'NYSE:GME';
  }

  // console.log(current);

  const options = {
    symbol: current || ticker,
    from: DEFAULT_FROM_DATE,
    to: moment().format('YYYY-MM-DD')
  };

  // console.log(options);

  return getTimeseries(options)
    .then((data) => {
      return Service.save(ticker, data);
    });
};

const getSymbol = (ticker) => {
  let current;

  if(ticker === 'GME') {
    current = 'NYSE:GME';
  }

  return current || ticker;
}

const getModel = (ticker) => {
  return Service.get(ticker)
    .then(Model.TreeStockPrices)
};

const getTickersWithouhtHistoricals = () => {
  return StockService.getTickersFromResources()
    .then((tickers) => {
      return _.filter(tickers, (ticker) => {
        const filepath = Service.getPathToHistorical(ticker);
        return fs.existsSync(filepath) === false;
      });
    });
};

const prepareAndSaveAllMissingHistoricals = () => {
  return getTickersWithouhtHistoricals()
    .then(prepareAndSaveAll);
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
        _.set(historicals[ticker], 'historical', Model.TreeStockPrices(historical));
      });

      return historicals;
    });
};

const update = (ticker) => {
  return getModel(ticker)
    .then((prices) => {
      const data = prices.getData();

      if(data.length === 0) {
        return;
      } else {
        const now = new Date();
        const missingDays = prices.getDaysDifferenceFromLastTo(now);

        if(missingDays > 4) {
          console.log(`${ticker} missing ${missingDays}`);
          const lastDate = prices.getLastDate(now);
          const symbol = getSymbol(ticker);
          // console.log(lastDate);

          const options = {
            symbol,
            from: moment(lastDate).add(1, 'days').format('YYYY-MM-DD'),
            to: moment().format('YYYY-MM-DD')
          };

          // console.log(options);

          return getTimeseries(options)
            .then((series) => {
              if(series) {
                return _.concat(data, series);
              }
            });
        }
      }
    })
    .then((data) => {
      if(data) {
        return Service.save(ticker, data);
      }
    });
};

const updateAll = (tickers) => {
  let promisedTickers;

  if(tickers){
    promisedTickers = Promise.resolve(tickers);
  } else {
    promisedTickers = StockService.getStocksFromResources()
      .then(_.keys);
  }

  return promisedTickers
    .then(updateAllTickers)
    .then(() => {
      console.log('all summaries created!');
    })
    .catch(console.log);
};

const updateAllTickers = (tickers = []) => {
  if(tickers.length === 0) {
    return Promise.resolve(null);
  } else {
    const ticker = _.head(tickers);
    console.log(`Update historicals of ${ticker}! Left ${tickers.length-1}`);

    return update(ticker)
      .then(() => {
        return updateAllTickers(_.tail(tickers));
      });
  }
};

module.exports = {
  getModel,
  getAllAsModels,
  historical,
  prepareAndSaveAll,
  prepareAndSaveAllMissingHistoricals,
  save,
  update,
  updateAll,
};
