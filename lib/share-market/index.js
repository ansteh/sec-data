const Stock         = require('../stock');
const StockService  = require('../stock/service.js');

const Price         = require('../stock/price');
const PriceService  = require('../stock/price/service.js');

const Model         = require('./model');

const Promise = require('bluebird');
const _       = require('lodash');

const getMarket = () => {
  let market;

  return StockService.getStocksFromResources()
    .then((stocks) => {
      market = stocks;
    })
    .then(() => {
      return getSummaries(market);
    })
    .then(() => {
      return getHistoricals(market);
    })
    .then(() => {
      return Model.create(market);
    });
};

const getSummaries = (market) => {
  return StockService.getSummary(_.keys(market))
    .then((summaries) => {
      _.forOwn(summaries, (summary, ticker) => {
        _.set(market[ticker], `summary`, summary);
      });
    });
};

const getHistoricals = (market) => {
  return Price.getAllAsModels(_.keys(market))
    .then((historicals) => {
      _.forOwn(historicals, ({ historical }, ticker) => {
        _.set(market[ticker], `historical`, historical);
      });
    });
};

getMarket()
  .then((market) => {
    return [
      market.findByFormat('AAOI', '2017-11-28'),
      market.findByFormat('AAPL', '2017-11-28'),
    ];
  })
  .then(console.log)
  .catch(console.log)
