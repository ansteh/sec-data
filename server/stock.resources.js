const _           = require('lodash');

const StockService  = require('../lib/stock/service.js');
const PriceService  = require('../lib/stock/price/service.js');

const getStock = (ticker) => {
  const stock = {};

  return StockService.findByTicker(ticker)
    .then((resource) => {
      if(resource) {
        stock.resource = resource;
      }

      return StockService.getSummary(ticker);
    })
    .then((summaries) => {
      const summary = _.get(summaries, ticker);
      if(summary) {
        stock.summary = summary;
      }

      return PriceService.get(ticker);
    })
    .then((historicals) => {
      if(historicals) {
        stock.historicals = historicals;
      }

      return stock;
    })
};

const getAllTickers = () => {
  return StockService.getTickersFromResources();
};

module.exports = {
  getAllTickers,
  getStock,
};
