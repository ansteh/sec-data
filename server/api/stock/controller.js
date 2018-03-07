const _      = require('lodash');
const Stock = require('./model.js');

module.exports = {
  findByTicker: Stock.findByTicker,
  getHistoricals: Stock.getHistoricals,
  getSummary: Stock.getSummary,
};
