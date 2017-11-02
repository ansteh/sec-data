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

const filterKeys = (ticker, str) => {
  return Stock.getAllFilings(ticker)
    .then((filings) => {
      return filterKeysContainsByFilings(filings, str);
    });
};

const filterKeysContainsByFilings = (filings, str) => {
  return _.reduce(filings, (keys, filing) => {
    const subKeys = filterKeysContainsByFiling(filing, str);
    return _.uniq([...keys, ...subKeys]);
  }, []);
};

const filterKeysContainsByFiling = (filing, str) => {
  return _
    .chain(_.keys(filing))
    .filter((key) => {
      return _.includes(key, str);
    })
    .value();
};

const countKeys = (ticker, str) => {
  return Stock.getAllFilings(ticker)
    .then((filings) => {
      return countKeysContainsByFilings(filings, str);
    });
};

const countKeysContainsByFilings = (filings, str) => {
  const account = _.reduce(filings, (counter, filing) => {
    const keys = filterKeysContainsByFiling(filing, str);

    _.forEach(keys, (key) => {
      if(_.has(counter, key)) {
        counter[key] += 1;
      } else {
        counter[key] = 1;
      }
    });

    return counter;
  }, {});

  const collection = _
    .chain(account)
    .map((count, key) => {
      return { key, count };
    })
    .sortBy(({ count }) => {
      return -count;
    })
    .value();

  return _.reduce(collection, (counter, { key, count }) => {
    counter[key] = count;
    return counter;
  }, {});
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

// filterKeys('GM', 'gaap:')
//   .then(keys => console.log(keys.length))
//   .catch(console.log);

// countKeys('GM', 'gaap:')
//   .then(keys => console.log(keys))
//   // .then(keys => console.log(_.keys(keys).length))
//   .catch(console.log);

module.exports = {
  getAndSaveGaapMetrics,
};
