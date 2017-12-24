const _             = require('lodash');
const Promise       = require('bluebird');
const moment        = require('moment');

const Stock         = require('../index.js');
const Service       = require('../service.js');

const gaap          = require('../../modules/gaap');
const PeriodReducer = require('../reducers/period.reducer');
const FilingReducer = require('../reducers/filing.reducer');

const fundamentals  = require('../../fundamentals/metrics');
const Metrics       = require('./metrics');
const Summary       = require('./index');

// Summary.prepareAndSaveAll();
// Summary.prepareAndSaveAllMissingSummaries();

// Summary.removeAll()
//   .then(console.log)
//   .catch(console.log);

// Service.removeSummary('AAOI')
//   .then(console.log)
//   .catch(console.log);

// Summary.prepareAndSave('AAOI')
//   .then(console.log)
//   .catch(console.log);

// getAndSaveMetrics('GME', 'CommonStockDividendsPerShareCashPaid')
//   .then(console.log)
//   .catch(console.log);

// getAndSaveGaapMetrics('GM')
//   .then(console.log)
//   .catch(console.log);

// 'CommonStockDividendsPerShareCashPaid',
// 'CommonStockDividendsPerShareDeclared',
// 'Dividends',
// 'EarningsPerShareBasic',
// 'EarningsPerShareDiluted',
// 'SharesOutstanding',

// 'CommonStockSharesAuthorized',
// 'CommonStockSharesIssued',
// 'CommonStockSharesOutstanding',
// 'PreferredStockSharesAuthorized',
// 'WeightedAverageNumberOfDilutedSharesOutstanding',
// 'WeightedAverageNumberOfSharesOutstandingBasic',

// getMetrics('GME', 'EarningsPerShareDiluted')
//   .then(json => console.log(JSON.stringify(_.get(json, 'annual'), null, 2)))
//   .catch(console.log);

// filterKeys('GM', 'gaap:')
//   .then(keys => console.log(keys.length))
//   .catch(console.log);

// countKeys('GM', 'gaap:')
//   .then(keys => console.log(keys))
//   // .then(keys => console.log(_.keys(keys).length))
//   .catch(console.log);

// Service.getQuarterlyFilings('GM')
// // Service.getAnnualFilings('GM')
//   .then(FilingReducer.sortFilings)
//   .then(filings => _.map(filings, getFundamentals))
//   // .then(fundamentals => _.map(fundamentals, 'DocumentPeriodEndDate'))
//   .then(FilingReducer.getAllProperties)
//   .then(console.log)
//   .catch(console.log);

// getFundamentalsByTicker('GM')
//   .then(console.log)
//   .catch(console.log);

// const ticker = 'AAOI';
// const date = new Date();
// // const date = "2012-12-31";
// // const date = "2013-03-31";
// // const date = "2012-06-30";
//
// Service.getSummary(ticker)
//   .then(summary => _.get(summary, ticker))
//   .then((stock) => {
//     return _.get(stock, 'quarterly');
//   })
//   .then((filings) => {
//     // return fundamentals.getBookValuePerShare(filings);
//     // return fundamentals.getCashflowDiscount(filings);
//     return fundamentals.getTrailingTwelveMonthsEarningsPerShareDiluted(filings, date);
//   })
//   .then(console.log)
//   .catch(console.log);
