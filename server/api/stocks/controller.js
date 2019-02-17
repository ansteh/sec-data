const _       = require('lodash');
const Stocks  = require('./model.js');
const Filters = require('./filter.js');

const { appendValuationsTo } = require('../../modules/valuations');

const filter = (options) => {
  // const DerivedTrailingTwelveMonthsEarningsPerShareDiluted
  const paths = {
    intrinsicValue: 'annual.DerivedDCF_IntrinsicValue_MAX_GROWTH_RATE_20_BY_MEAN',
    freeCashFlowIntrinsicValue: 'annual.FreeCashFlow_IntrinsicValue',
    earnings: 'quarterly.DerivedTrailingTwelveMonthsEarningsPerShareDiluted', //'annual.EarningsPerShareDiluted',
    bookValue: 'annual.DerivedBookValuePerShare',
  };

  const testAggregate = Filters.batch(
    [
      { path: paths.intrinsicValue },
      { path: paths.freeCashFlowIntrinsicValue },
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
        params: _.pick(row, ['margin', 'freeCashFlowMargin', 'PE', 'PB'])
      }
    })
    .keyBy('ticker')
    .value();
};

const get = (options, paths) => {
  const instructions = Filters.batch(paths, options);
  return Stocks.aggregate(instructions);
};

module.exports = {
  get,
  getResources: Stocks.getResources,
  getResourcesByTicker: Stocks.getResourcesByTicker,
  filter,
};
