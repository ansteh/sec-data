const _       = require('lodash');
const Stocks  = require('./model.js');
const Filters = require('./filter.js');

const { appendValuationsTo } = require('../../modules/valuations');

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

  appendValuationsTo(paths, pipeline);

  // pipeline.push({
  //   $match: {
  //     margin: { $ne : null }
  //   }
  // });

  return Stocks.aggregate(testAggregate)
    .then(prepare)
};

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

module.exports = {
  getResources: Stocks.getResources,
  getResourcesByTicker: Stocks.getResourcesByTicker,
  filter: filter,
};

// const tickers = require('../../../lib/account/importers/degiro/resources/tickers.json');
// filter({ tickers, date: new Date(2018, 6, 27) })
//   .then(result => JSON.stringify(result, null, 2))
//   .then(console.log)
//   .catch(console.log)
