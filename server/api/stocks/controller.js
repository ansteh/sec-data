const _      = require('lodash');
const Stocks = require('./model.js');

module.exports = {
  getResources: Stocks.getResources,
  getResourcesByTicker: Stocks.getResourcesByTicker,
};
