const _             = require('lodash');
const Promise       = require('bluebird');
const moment        = require('moment');

const Stock         = require('../index.js');
const Service       = require('../service.js');

const gaap          = require('../../modules/gaap');
const PeriodReducer = require('../reducers/period.reducer');
const FilingReducer = require('../reducers/filing.reducer');

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

const getFundamentals = (filing) => {
  return _.get(filing, 'FundamentalAccountingConcepts');
};

const getFundamentalsByTicker = (ticker, type = 'annual') => {
  let source;

  if(type === 'annual') {
    source =  Service.getAnnualFilings(ticker);
  }

  if(type === 'quarterly') {
    source =  Service.getQuarterlyFilings(ticker);
  }

  if(source) {
    return source
      .then(getFundamentalsFromFilings);
  } else {
    return Promise.of(null);
  }
};

const getFundamentalsFromFilings = (filings) => {
  filings = FilingReducer.sortFilings(filings);
  return _.map(filings, getFundamentals);
};

const prepare = (ticker) => {
  const batches = [
    Service.getAnnualFilings(ticker),
    Service.getQuarterlyFilings(ticker)
  ];

  return Promise.all(batches)
    .then(([annual, quarterly]) => {
      const filings = _.flatten([annual, quarterly]);

      const metrics = gaap.PROPERTIES.map((property) => {
        return getMetricsByFilings(filings, property);
      });

      let summary = _.reduce(metrics, (reduced, metric) => {
        return _.merge(reduced, metric);
      }, {});

      summary = _.merge(summary, {
        annual: {
          FundamentalAccountingConcepts: getFundamentalsFromFilings(annual)
        }
      });

      summary = _.merge(summary, {
        quarterly: {
          FundamentalAccountingConcepts: getFundamentalsFromFilings(quarterly)
        }
      });

      return summary;
    });
};

const prepareAndSave = (ticker) => {
  return prepare(ticker)
    .then((summary) => {
      return Stock.saveSummary(ticker, summary);
    });
};

const prepareAndSaveAll = () => {
  Service.getStocksFromResources()
    .then(_.keys)
    .then(prepareAndSaveTickers)
    .then(() => {
      console.log('all summaries created!');
    })
    .catch(console.log);
}

const prepareAndSaveTickers = (tickers = []) => {
  if(tickers.length === 0) {
    return Promise.of(null);
  } else {
    const ticker = _.head(tickers);
    console.log(`prepare ${ticker} summary! Left ${tickers.length-1}`);

    return prepareAndSave(ticker)
      .then(() => {
        return prepareAndSaveTickers(_.tail(tickers));
      });
  }
};

prepareAndSaveAll();

// prepareAndSave('ZUMZ')
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

module.exports = {
  getAndSaveGaapMetrics,
  getFundamentalsByTicker,
};
