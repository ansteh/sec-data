const _             = require('lodash');
const Promise       = require('bluebird');

const Stock         = require('../index.js');
const PeriodReducer = require('../reducers/period.reducer');
const gaap          = require('../../modules/gaap');

const getAndSaveGaapMetrics = (ticker) => {
  return Stock.getAllFilings(ticker)
    .then((filings) => {
      return gaap.PROPERTIES.map((property) => {
        return getMetricsByFilings(filings, property);
      });
    })
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
  return Stock.getAllFilings(ticker)
    .then((filings) => {
      return getMetricsByFilings(filings, property);
    })
};

const getMetricsByFilings = (filings, property) => {
  const annual = getAnnualMetrics(filings, property);
  const quarterly = getQuartelyMetrics(filings, property);

  const metrics = {};
  _.set(metrics, `annual.${property}`, annual);
  _.set(metrics, `quarterly.${property}`, quarterly);

  return metrics;
};

const getAnnualMetrics = (filings, property) => {
  return Stock.filterFilings(filings, PeriodReducer.filterAnnualPeriods, property);
};

const getQuartelyMetrics = (filings, property) => {
  return Stock.filterFilings(filings, PeriodReducer.filterQuartelyPeriods, property);
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

// getMetrics('GM', 'EarningsPerShareDiluted')
//   .then(json => console.log(JSON.stringify(json, null, 2)))
//   .catch(console.log);

module.exports = {
  getAndSaveGaapMetrics,
};
