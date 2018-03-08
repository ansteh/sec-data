const _      = require('lodash');
const Stocks = require('./model.js');

const {
  aggregateBy__DerivedDCF_IntrinsicValue,
  filterBy__DerivedDCF_IntrinsicValue,
} = require('./filter.js');

module.exports = {
  getResources: Stocks.getResources,
  getResourcesByTicker: Stocks.getResourcesByTicker,
};

// Stocks.filter(filterBy__DerivedDCF_IntrinsicValue({ ticker: 'AAPL', date: '2017-09-30' }))
//   .then(result => JSON.stringify(result, null, 2))
//   .then(console.log)
//   .catch(console.log)

Stocks.aggregate(aggregateBy__DerivedDCF_IntrinsicValue({ ticker: 'AAPL', date: '2017-09-30' }))
  .then(result => JSON.stringify(result, null, 2))
  .then(console.log)
  .catch(console.log)
