const _       = require('lodash');
const Stocks  = require('../stocks/model.js');
const Filters = require('../stocks/filter.js');

const Account = require('../../../lib/account/importers/degiro/index.js');

const { appendValuationsTo } = require('../../modules/valuations');

const getBy = (options) => {
  let tickers;

  return Account.getPortfolio()
    .then((portfolio) => {
      const tickers = _
        .chain(portfolio)
        .map('ticker')
        .filter(_.isString)
        .value();

      return getStocks(_.assign({ tickers }, options))
        .then((stocks) => {
          return _.map(portfolio, (position) => {
            position.stock = _.find(stocks, { ticker: position.ticker });
            return position;
          });
        });
    })
};

const getStocks = (options) => {
  // const DerivedTrailingTwelveMonthsEarningsPerShareDiluted
  const paths = {
    intrinsicValue: 'annual.DerivedDCF_IntrinsicValue_MAX_GROWTH_RATE_20_BY_MEAN',
    earnings: 'quarterly.DerivedTrailingTwelveMonthsEarningsPerShareDiluted', //'annual.EarningsPerShareDiluted',
    bookValue: 'annual.DerivedBookValuePerShare',
    roe: 'annual.FundamentalAccountingConcepts.ROE',
    roa: 'annual.FundamentalAccountingConcepts.ROA',
  };

  const testAggregate = Filters.batch(
    [
      { path: paths.intrinsicValue },
      { path: paths.earnings },
      { path: paths.bookValue },
      { path: paths.roe },
      { path: paths.roa },
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
    // .then(prepare)
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
  getBy,
};

// const tickers = require('../../../lib/account/importers/degiro/resources/tickers.json');
// getStocks({ tickers, date: new Date(2018, 6, 27) })
//   .then(result => JSON.stringify(result, null, 2))
//   .then(console.log)
//   .catch(console.log)
