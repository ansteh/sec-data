const fs        = require('fs');
const _         = require('lodash');
const util      = require('../util.js');

const Stock = require('../stock');

const ISSUES_DIRECTORY = `${__dirname}/../../resources/issues/`;

const getStocksOf = (directory) => {
  return util.loadFileContent(`${ISSUES_DIRECTORY}${directory}`)
    .then((content) => {
      return JSON.parse(content)
        .stocks
        .filter((seed) => {
          return _.has(seed, 'sec.forms.annual');
        });
    });
};

const getStocksWithEmptyFilings = (directory) => {
  return getStocksOf(directory)
    .then((stocks) => {
      const stocksWithFilingsStatus = _.map(stocks, (stock) => {
        return Stock.hasEmptyFilings(stock.ticker)
          .then((empty) => {
            return { empty, stock };
          });
      });

      return Promise.all(stocksWithFilingsStatus)
        .then((status) => {
          return _
            .chain(status)
            .filter(status => status.empty)
            .map('stock')
            .value();
        });
    });
};

module.exports = {
  getStocksOf,
  getStocksWithEmptyFilings,
};
