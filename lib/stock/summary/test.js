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

Summary.prepare('AAPL')
  // .then(content => content.annual)
  // .then(content => _.set(content, 'FundamentalAccountingConcepts', undefined))
  // .then(content => _.last(content.annual.FundamentalAccountingConcepts).NetCashFlowsOperating)
  // .then(content => content.quarterly.PaymentsToAcquirePropertyPlantAndEquipment)
  // .then(content => content.annual.PaymentsToAcquirePropertyPlantAndEquipment)
  // .then(console.log)
  .then((content) => {
    console.log(content.annual.FreeCashFlowPerShare);
    console.log(content.annual.FreeCashFlow_IntrinsicValue);
    console.log(content.annual.FreeCashFlow_IntrinsicValue_BY_MEAN);
  })
  .catch(console.log);

// Summary.prepareAndSave('SDLP')
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

// Summary.getMetrics('AAPL', 'NetCashFlowsOperating')
//   .then(json => console.log(JSON.stringify(_.get(json, 'annual'), null, 2)))
//   .catch(console.log);

// Summary.getMetrics('SDLP', 'EarningsPerShareBasicAndDiluted')
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
// // Service.getSummary(ticker)
// //   .then(summary => _.get(summary, ticker))
// //   .then((stock) => {
// //     return _.get(stock, 'quarterly');
// //   })
// //   .then((filings) => {
// //     // return fundamentals.getBookValuePerShare(filings);
// //     // return fundamentals.getCashflowDiscount(filings);
// //     // return fundamentals.getCashflowDiscountAsCollection(filings);
// //     // return fundamentals.getTrailingTwelveMonthsEarningsPerShareDiluted(filings, date);
// //     // return fundamentals.getTrailingTwelveMonthsEarningsPerShareDilutedAsCollection(filings);
// //   })
// //   .then(console.log)
// //   .catch(console.log);
//
// Service.getSummary(ticker)
//   .then(summary => _.get(summary, ticker))
//   .then((summary) => {
//     // return fundamentals.getTrailingTwelveMonthsDiscountCashflow(summary, new Date(), 0.2);
//     return fundamentals.getTrailingTwelveMonthsDiscountCashflowAsCollection(summary, 0.2);
//     // return fundamentals.getTrailingTwelveMonthsDiscountCashflowAsCollection(summary);
//   })
//   .then(console.log)
//   .catch(console.log);
