const _       = require('lodash');
const util    = require('../util.js');

const StockService = require('../stock/service');
const Filings      = require('../filings');

const SOURCE = `${__dirname}/../../resources/tickers/stocks.json`;

const getAll = () => {
  return getJSON(SOURCE);
};

const getJSON = (filepath) => {
  return util.loadFileContent(filepath)
    .then(content => JSON.parse(content))
};

const getExistingTickers = async () => {
  return StockService.getTickersFromResources();
  // return StockService.getStocksFromResources()
  //   .then(stocks => _.map(stocks, 'ticker'));
};

const insertTickers = async (candidates) => {
  const stocks = await getAll();
  
  _.forOwn(candidates, (stock, ticker) => {
    if((ticker.indexOf('&') === -1) && _.isUndefined(stocks[ticker])) {
      stocks[ticker] = stock;
    }
  });
  
  return saveTickers(stocks);
};

const mergeTickers = (filename = 'stocks-new.json') => {
  const filepath = `${__dirname}/../../resources/tickers/${filename}`;    
  return insertTickers(await getJSON(filepath));
};

const saveTickers = tickers => util.writeFile(SOURCE, JSON.stringify(tickers));

module.exports = {
  getAll,
  getExistingTickers,
  mergeTickers,
  saveTickers,
};