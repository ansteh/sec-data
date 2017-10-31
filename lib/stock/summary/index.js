const _             = require('lodash');
const Promise       = require('bluebird');

const Stock         = require('../index.js');
const PeriodReducer = require('../reducers/period.reducer');
const gaap          = require('../../modules/gaap');

const getAndSaveGaapMetrics = (ticker) => {
  const metrics = gaap.PROPERTIES.map((property) => {
    return getMetrics(ticker, property);
  });

  return Promise.all(metrics)
    .then((metrics) => {
      return _.reduce(metrics, (reduced, metric) => {
        return _.merge(reduced, metric);
      }, {})
    })
    .then((metrics) => {
      return Stock.saveSummary(ticker, metrics);
    });
};

const getAndSaveMetrics = (ticker, property) => {
  return getMetrics(ticker, property)
    .then((metrics) => {
      return Stock.saveSummary(ticker, metrics);
    })
};

const getMetrics = (ticker, property) => {
  return Promise.all([
    getAnnualMetrics(ticker, property),
    getQuartelyMetrics(ticker, property)
  ])
  .then(([annual, quarterly]) => {
    const metrics = {};
    _.set(metrics, `annual.${property}`, annual);
    _.set(metrics, `quarterly.${property}`, quarterly);

    return metrics;
  });
};

const getAnnualMetrics = (ticker, property) => {
  return Stock.getMetrics(ticker, property, PeriodReducer.filterAnnualPeriods);
};

const getQuartelyMetrics = (ticker, property) => {
  return Stock.getMetrics(ticker, property, PeriodReducer.filterQuartelyPeriods);
};

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

// getMetrics('GM', 'SharesOutstanding')
//   .then(json => console.log(JSON.stringify(json, null, 2)))
//   .catch(console.log);

module.exports = {
  getAndSaveGaapMetrics,
};
