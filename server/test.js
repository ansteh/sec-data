const _         = require('lodash');
const Resources = require('./stock.resources.js');
const Promise   = require('bluebird');

const {
  dropCollection,
  findAllTickers,
  findByTicker,
  findStocks,
  findLastHistoricals,
  getHistoricals,
  insertStocks,
  updateStock,
} = require('./stocks.js');

const stocks = [
  { ticker: 'AAPL' },
  { ticker: 'GM' },
];

// findStocks({ ticker: 'GM'})
//   .then(stocks => _.map(stocks, 'ticker'))
//   .then(console.log)
//   // .then(stocks => console.log(_.get(_.first(stocks), 'historicals')))
//   .catch(console.log);

// findStocks({ ticker: 'GM' })
//   .then(_.first)
//   .then(_.keys)
//   .then(console.log)
//   // .then(stocks => console.log(_.get(_.first(stocks), 'historicals')))
//   .catch(console.log);

// getHistoricals({ ticker: 'GM', range: { start: '2012-01-02T23:00:00.000Z'} })
//   .then(_.first)
//   .then(console.log)
//   .catch(console.log);

// Model.findLastHistoricals({ ticker: 'FRAN' })
findLastHistoricals({ olderThan: { unit: 'days', value: 11 } })
  .then(console.log)
  .catch(console.log)
