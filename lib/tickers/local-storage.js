const _       = require('lodash');
const util    = require('../util.js');

const StockService = require('../stock/service');
const Filings      = require('../filings');

const SOURCE = `${__dirname}/../../resources/tickers/stocks.json`;

const getAll = () => {
  return util.loadFileContent(SOURCE)
    .then(content => JSON.parse(content))
};

const getExistingTickers = async () => {
  return StockService.getTickersFromResources();
  // return StockService.getStocksFromResources()
  //   .then(stocks => _.map(stocks, 'ticker'));
};

const mergeTickers = (filename = 'stocks-new.json') => {
  const resource = require(`${__dirname}/../../resources/tickers/${filename}`);
  const stocks = require(SOURCE);

  _.forOwn(resource, (stock, ticker) => {
    if((ticker.indexOf('&') === -1) && _.isUndefined(stocks[ticker])) {
      stocks[ticker] = stock;
    }
  });

  // console.log(_.keys(stocks).length);

  return saveTickers(stocks);
};

const saveTickers = tickers => util.writeFile(SOURCE, JSON.stringify(tickers));

module.exports = {
  getAll,
  getExistingTickers,
  mergeTickers,
  saveTickers,
};