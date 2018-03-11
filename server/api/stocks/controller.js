const _       = require('lodash');
const Stocks  = require('./model.js');
const Filters = require('./filter.js');

module.exports = {
  getResources: Stocks.getResources,
  getResourcesByTicker: Stocks.getResourcesByTicker,
};

// Stocks.filter(Filters.filterBy__DerivedDCF_IntrinsicValue({ ticker: 'AAPL', date: '2017-09-30' }))
//   .then(result => JSON.stringify(result, null, 2))
//   .then(console.log)
//   .catch(console.log)

// Stocks.aggregate(Filters.aggregateBy__DerivedDCF_IntrinsicValue({ ticker: 'AAPL', date: '2017-09-30' }))
//   .then(result => JSON.stringify(result, null, 2))
//   .then(console.log)
//   .catch(console.log)

// const testAggregateHistoricalBy = Filters.aggregateHistoricalBy({ ticker: 'AAPL', date: '2018-01-11' });
// // console.log(JSON.stringify(testAggregateHistoricalBy, null, 2));
//
// Stocks.aggregate(testAggregateHistoricalBy)
//   .then(result => JSON.stringify(result, null, 2))
//   .then(console.log)
//   .catch(console.log)

const testAggregate = Filters.batch(
  [{ path: 'annual.DerivedDCF_IntrinsicValue' }],
  { date: '2018-01-11' }
);
// console.log(JSON.stringify(testAggregate, null, 2));

const { pipeline } = testAggregate;
pipeline.push({
  $project: {
    ticker: 1,
    historicals: 1,
    'summary.annual.DerivedDCF_IntrinsicValue': 1,
    // DerivedDCF_IntrinsicValue: { $arrayElemAt: [ "$summary.annual.DerivedDCF_IntrinsicValue", -1 ] },
    // historical: { $arrayElemAt: [ "$historicals", -1 ] },
    // marginOfSafety: { $subtract: [ "$summary.annual.DerivedDCF_IntrinsicValue.value", "$historicals.close" ] }
    marginOfSafety: {
      $divide: [
        { $subtract: [ "$summary.annual.DerivedDCF_IntrinsicValue.value", "$historicals.close" ] },
        "$summary.annual.DerivedDCF_IntrinsicValue.value"
      ]
    }
  }
});

Stocks.aggregate(testAggregate)
  .then(result => JSON.stringify(result, null, 2))
  .then(console.log)
  .catch(console.log)
