const _ = require('lodash');
const moment = require('moment');

const findSameOrBefore = require('../modules/timeseries/findSameOrBefore');

const Simulation = require('./simulation.js');
const Spreads    = require('./extensions/spreads');

const {
  findAllByFormat,
  findByFormat,
  getMetric,

  getAllMetricMarginByPrice,
  getMetricMarginByPrice,
  getMargin,

  getAllMetricsBy,
  getMetricByPrice,
} = require('./metrics');

const Filters = require('./filters');

const getTickersWithEmptyHistoricals = (stocks) => {
  const tickers = [];

  _.forOwn(stocks, (stock, ticker) => {
    if(stock.historical.isEmpty()) {
      tickers.push(ticker);
    }
  });

  return tickers;
};

const getAllMetricByPrice = getAllMetricsBy(getMetricByPrice);
const getAllFundamentals = getAllMetricsBy(getMetric);

const getTimeline = (stocks) => {
  const stock = _.get(stocks, 'AAPL');
  const historicals = stock.historical.getData('2008-09-27');
  // const historicals = stock.historical.getData('2018-01-01');

  return _.map(historicals, (entry) => {
    return entry.date.substr(0, 10);
  });
};

const create = (stocks) => {
  const getStocks = () => {
    return stocks;
  };

  const getStock = (ticker) => {
    return stocks[ticker];
  };

  const getSummary = (ticker) => {
    return _.get(getStock(ticker), 'summary');
  };

  const getSpreadGrowthRateByTicker = (ticker) => {
    const stock = getStock(ticker);
    return Spreads.getSpreadGrowthRatesBy(stock);
  };

  const getShareMarketSpreads = () => {
    const tickers = _.keys(stocks);
    const spreads = _.map(tickers, getSpreadGrowthRateByTicker);

    return Spreads.getShareMarket(spreads);
  };

  return {
    getStocks,

    getStock,
    getSummary,

    getSpreadGrowthRateByTicker,
    getShareMarketSpreads,

    getMetric: getMetric(stocks),

    findByFormat: findByFormat(stocks),
    findAllByFormat: findAllByFormat(stocks),

    getAllMetricByPrice: getAllMetricByPrice(stocks),
    getAllFundamentals: getAllFundamentals(stocks),

    getAllMetricMarginByPrice: getAllMetricMarginByPrice(stocks),
    getMetricMarginByPrice: getMetricMarginByPrice(stocks),

    getTickersWithEmptyHistoricals: () => getTickersWithEmptyHistoricals(stocks),
    getTimeline: () => getTimeline(stocks),
  };
};

const createShareMarketTimeline = ({ market, scopes }) => {
  scopes = _.keyBy(scopes, 'path');

  const aheadOfTimePaths = _
    .chain(scopes)
    .filter(({ buildTime }) => {
      return buildTime === 'aot';
    })
    .map('path')
    .value();

  const timeline = market.getTimeline();

  let scope = {};
  _.forOwn(scopes, ({ buildTime, path, aggregate, evaluate }) => {
    if(_.isString(aggregate)) {
      const subScope = market[aggregate](path, evaluate);
      scope = _.merge(scope, subScope);
    }
  });

  const tickers = _.keys(scope);

  const getClose = (ticker, date) => {
    const entry = market.findByFormat(ticker, date);
    return _.get(entry, 'close');
  };

  const findFact = _.curry((path, ticker, date) => {
    const facts = scope[ticker][path];

    const fact = findSameOrBefore(facts, 'endDate', date);
    const entry = market.findByFormat(ticker, date);

    // return { entry, fact, facts };
    return { entry, fact };
  });

  const findAllStates = (date) => {
    return _.reduce(aheadOfTimePaths, (states, path) => {
      return _.merge(states, findStatesByPath(path, date));
    }, {});
  };

  const findStatesByPath = (path, date) => {
    return _.reduce(tickers, (states, ticker) => {
      const state = findStateByPath(path, date, ticker);

      if(_.isUndefined(states[ticker])) {
        states[ticker] = {};
      }

      states[ticker][path] = state;

      return states;
    }, {});
  };

  const findStateByPath = (path, date, ticker) => {
    let state;

    if(_.has(scopes[path], 'findFact')) {
      const facts = scope[ticker][path];
      state = scopes[path]['findFact']({ facts, date });
    } else {
      state = findFact(path, ticker, date);
    }

    if(state.fact && state.entry) {
      const { value, endDate } = state.fact;
      const { close, date } = state.entry;

      if(value > 0) {
        state.margin = getMargin(value, close);
      }
    }

    return state;
  };

  const filterBy = (filter, date) => {
    const candidates = findAllStates(date);

    _.forOwn(candidates, (state, ticker) => {
      state.ticker = ticker;
    });

    return filter(candidates, { date, findStateByPath, market });
  };

  const simulator = Simulation.create({
    market,
    timeline,
    findAllStates,
    findStateByPath,
    strategies: {
      filterCandidatesForBuying: Filters.filterCandidatesForBuying,
      filterCandidatesForSelling: Filters.filterCandidatesForBuying,
    }
  });

  return {
    market,
    filterBy,
    findAllStates,
    simulate: (path) => simulator.simulate(path),
  };
};

module.exports = {
  create,
  createShareMarketTimeline,
};
