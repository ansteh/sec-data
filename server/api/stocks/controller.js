const _       = require('lodash');
const Stocks  = require('./model.js');
const Filters = require('./filter.js');

const prepare = (results) => {
  return _
    .chain(results)
    .map((row) => {
      return {
        ticker: row.ticker,
        params: _.pick(row, ['margin', 'PE', 'PB'])
      }
    })
    .keyBy('ticker')
    .value();
};

const filter = (options) => {
  // const DerivedTrailingTwelveMonthsEarningsPerShareDiluted
  const paths = {
    intrinsicValue: 'annual.DerivedDCF_IntrinsicValue_MAX_GROWTH_RATE_20_BY_MEAN',
    earnings: 'quarterly.DerivedTrailingTwelveMonthsEarningsPerShareDiluted', //'annual.EarningsPerShareDiluted',
    bookValue: 'annual.DerivedBookValuePerShare',
  };

  const testAggregate = Filters.batch(
    [
      { path: paths.intrinsicValue },
      { path: paths.earnings },
      { path: paths.bookValue },
      // { path: 'quarterly.FundamentalAccountingConcepts.ROE' },
      // { path: 'quarterly.FundamentalAccountingConcepts.ROA' },
    ],
    options
  );
  // console.log(JSON.stringify(testAggregate, null, 2));

  const { pipeline } = testAggregate;
  pipeline.push({
    $project: {
      ticker: 1,
      historicals: 1,
      summary: 1,
      margin: {
        $divide: [
          { $subtract: [ `$summary.${paths.intrinsicValue}.value`, "$historicals.close" ] },
          `$summary.${paths.intrinsicValue}.value`
        ]
      },
      PE: {
        $divide: [
          "$historicals.close",
          `$summary.${paths.earnings}.value`,
        ]
      },
      PB: {
        $divide: [
          "$historicals.close",
          `$summary.${paths.bookValue}.value`,
        ]
      },
      // ROE: '$summary.FundamentalAccountingConcepts.ROE.value',
      // ROA: '$summary.FundamentalAccountingConcepts.ROA.value',
    }
  }, {
    $match: {
      margin: { $ne : null }
    }
  });

  return Stocks.aggregate(testAggregate)
    .then(prepare)
};

module.exports = {
  getResources: Stocks.getResources,
  getResourcesByTicker: Stocks.getResourcesByTicker,
  filter: filter,
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

// const testAggregate = Filters.batch(
//   [
//     { path: 'annual.DerivedDCF_IntrinsicValue_MAX_GROWTH_RATE_20_BY_MEAN', valuation: { type: 'margin' } },
//     { path: 'annual.DerivedBookValuePerShare', valuation: { type: 'closePricePer' } },
//     { path: 'quarterly.FundamentalAccountingConcepts.ROE' },
//     // { path: 'quarterly.FundamentalAccountingConcepts.ROA' },
//   ],
//   { date: '2018-01-11', ticker: 'FL' }
// );
//
// Stocks.aggregate(testAggregate)
//   .then(result => JSON.stringify(result, null, 2))
//   .then(console.log)
//   .catch(console.log)

// filter({ date: '2018-01-11', ticker: 'FL' })
//   .then(result => JSON.stringify(result, null, 2))
//   .then(console.log)
//   .catch(console.log)
