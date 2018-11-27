const _         = require('lodash');
const Resources = require('./stock.resources.js');
const Promise   = require('bluebird');

const Stocks = require('./stocks.js');

const stocks = [
  { ticker: 'AAPL' },
  { ticker: 'GM' },
];

// Stocks.findStocks({ ticker: 'GM'})
//   .then(stocks => _.map(stocks, 'ticker'))
//   .then(console.log)
//   // .then(stocks => console.log(_.get(_.first(stocks), 'historicals')))
//   .catch(console.log);

// Stocks.findStocks({ ticker: 'GM' })
//   .then(_.first)
//   .then(_.keys)
//   .then(console.log)
//   // .then(stocks => console.log(_.get(_.first(stocks), 'historicals')))
//   .catch(console.log);

// Stocks.getHistoricals({ ticker: 'GM', range: { start: new Date('2016-01-02T23:00:00.000Z')} })
//   .then(_.first)
//   .then(console.log)
//   .catch(console.log);

// Model.findLastHistoricals({ ticker: 'FRAN' })
// Stocks.findLastHistoricals({ olderThan: { unit: 'days', value: 11 } })
//   .then(console.log)
//   .catch(console.log)

const searchOptions = {
  tickers: ['AAPL', 'GM'],
  range: { start: new Date('2016-01-02T23:00:00.000Z') }
};

Stocks.getAllHistoricalsByTickers(searchOptions)
  .then(console.log)
  .catch(console.log)
