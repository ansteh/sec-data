const Stock         = require('../stock');
const StockService  = require('../stock/service.js');

const Price         = require('../stock/price');
const PriceModel    = require('../stock/price/model.js');
const PriceService  = require('../stock/price/service.js');

const Model         = require('./model');
const growthRate    = require('../modules/timeseries/growthRate.js');

const Promise = require('bluebird');
const _       = require('lodash');

const getMarket = () => {
  let stocks;

  return StockService.getStocksFromResources()
    .then((resources) => {
      stocks = resources;
    })
    .then(() => {
      return getSummaries(stocks);
    })
    .then(() => {
      return getHistoricals(stocks);
    })
    .then(() => {
      return Model.create(stocks);
    });
};

const getSummaries = (stocks) => {
  return StockService.getSummary(_.keys(stocks))
    .then((summaries) => {
      _.forOwn(summaries, (summary, ticker) => {
        _.set(stocks[ticker], `summary`, summary);
      });
    });
};

const getHistoricals = (stocks) => {
  return Price.getAllAsModels(_.keys(stocks))
    .then((historicals) => {
      _.forOwn(historicals, ({ historical }, ticker) => {
        _.set(stocks[ticker], `historical`, historical);
      });
    });
};

module.exports = {
  getMarket,
}
