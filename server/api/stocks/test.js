const Stocks = require('./controller');

// Stocks.get({ tickers: ['AAPL'], date: new Date(2018, 6, 27) },
//    [{ path: 'annual.EarningsPerShareDiluted'}])
//   .then(result => JSON.stringify(result, null, 2))
//   .then(console.log)
//   .catch(console.log)

// const tickers = require('../../../lib/account/importers/degiro/resources/tickers.json');
Stocks.filter({ tickers: ['KSS'], date: '2019-02-28' })
  .then(result => JSON.stringify(result, null, 2))
  .then(console.log)
  .catch(console.log)

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
//     {
//       path: 'annual.DerivedDCF_IntrinsicValue_MAX_GROWTH_RATE_20_BY_MEAN',
//       valuation: { type: 'margin' },
//       filter: { $gt: 0 },
//     },
//     {
//       path: 'annual.DerivedBookValuePerShare',
//       valuation: { type: 'closePricePer' },
//       // filter: { $gte: 0, $lte: 2 },
//     },
//     { path: 'quarterly.FundamentalAccountingConcepts.ROE' },
//     // { path: 'quarterly.FundamentalAccountingConcepts.ROA' },
//   ],
//   { date: '2018-01-11' }
//   // { date: '2018-01-11', ticker: 'FL' }
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

// filter({ date: '2018-01-11', tickers: ['FL', 'GM'] })
//   .then(result => JSON.stringify(result, null, 2))
//   .then(console.log)
//   .catch(console.log)
