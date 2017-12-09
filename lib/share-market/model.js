const _ = require('lodash');

const PriceModel = require('../stock/price/model.js');
const Simulation = require('./simulation.js');

const findAllByFormat = _.curry((stocks, ticker, dates) => {
  const stock = _.get(stocks, ticker);
  return stock.historical.findAllByFormat(dates);
});

const findByFormat = _.curry((stocks, ticker, date) => {
  const stock = _.get(stocks, ticker);
  return stock.historical.findByFormat(date);
});

const getMetric = _.curry((stocks, ticker, path) => {
  const stock = _.get(stocks, ticker);
  return _.get(stock, `summary.${path}`);
});

const getTickersWithEmptyHistoricals = (stocks) => {
  const tickers = [];

  _.forOwn(stocks, (stock, ticker) => {
    if(stock.historical.isEmpty()) {
      tickers.push(ticker);
    }
  });

  return tickers;
};

const getAllMetricMarginByPrice = _.curry((stocks, path) => {
  const margins = {};

  _.forOwn(stocks, (stock, ticker) => {
    margins[ticker] = {};
    margins[ticker][path] = getMetricMarginByPrice(stocks, ticker, path);
  });

  return margins;
});

const getMetricMarginByPrice = _.curry((stocks, ticker, path) => {
  const metric = getMetric(stocks, ticker, path);
  const dates = _.map(metric, 'endDate');
  const historical = findAllByFormat(stocks, ticker, dates);

  return _.reduce(metric, (margins, instance, index) => {
    const { value, endDate } = instance;
    const { close, date } = _.get(historical, index, { close: null, date: null });

    let margin = null;
    if(close && value > 0) {
      margin = getMargin(value, close);
    }

    margins.push({
      endDate,
      value,

      closeDate: date,
      close,

      margin,
    });

    return margins;
  }, []);
});

const getMargin = (value, price) => {
  return (value - price)/value;
};

const getAllMetricsBy = _.curry((getMetricBy, stocks, path, evaluate) => {
  const metrics = {};

  _.forOwn(stocks, (stock, ticker) => {
    metrics[ticker] = {};
    metrics[ticker][path] = getMetricBy(stocks, ticker, path, evaluate);
  });

  return metrics;
});

const getMetricByPrice = _.curry((stocks, ticker, path, evaluate) => {
  const metric = getMetric(stocks, ticker, path);
  const dates = _.map(metric, 'endDate');
  const historical = findAllByFormat(stocks, ticker, dates);

  return _.reduce(metric, (data, instance, index) => {
    const { value, endDate } = instance;
    const { close, date } = _.get(historical, index, { close: null, date: null });
    const price = close;
    const res = _.isNumber(price) ? evaluate(price, value) : null;

    data.push({
      priceDate: date,
      price,

      endDate,
      value,

      res,
    });

    return data;
  }, []);
});

const getAllMetricByPrice = getAllMetricsBy(getMetricByPrice);

const getTimeline = (stocks) => {
  const stock = _.get(stocks, 'AAPL');
  const historicals = stock.historical.getData('2008-09-27');

  return _.map(historicals, (entry) => {
    return entry.date.substr(0, 10);
  });
};

const State = _.curry(({ name, path, prepare }, market) => {
  // const getAllMetric = (ticker) => {
  //   return market.getMetric(ticker, path);
  // };

  return {
    // getMetric,
  };
});

const createShareMarketTimeline = (market, paths) => {
  const timeline = market.getTimeline();

  let scope = {};

  _.forEach(paths, (path) => {
    if(path === 'annual.EarningsPerShareDiluted') {
      const subScope = market.getAllMetricByPrice(path, (price, value) => {
        return price/value;
      });

      scope = _.merge(scope, subScope);
    } else {
      const subScope = market.getAllMetricMarginByPrice(path);
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

    const fact = PriceModel.matchByFormat(facts, 'endDate', date, 4);
    const entry = market.findByFormat(ticker, date);

    return { entry, fact };
  });

  const findStatesByPath = (path, date) => {
    return _.reduce(tickers, (states, ticker) => {
      const state = findFact(path, ticker, date);

      if(state.fact && state.entry) {
        const { value } = state.fact;
        const { close } = state.entry;

        if(value > 0) {
          state.margin = getMargin(value, close);
        }
      }

      if(_.isUndefined(states[ticker])) {
        states[ticker] = {};
      }

      states[ticker][path] = state;

      return states;
    }, {});
  };

  const findAllStates = (date) => {
    return _.reduce(paths, (states, path) => {
      return _.merge(states, findStatesByPath(path, date));
    }, {});
  };

  const getMargins = (path, date) => {
    const states = findAllStates(date);
    return _.mapValues(states, (state) => {
      return state[path]['margin'];
    });
  };

  const filterCandidatesForBuying = (candidates) => {
    console.log(`candidates before strategy filter: ${_.keys(candidates).length}`);

    _.forOwn(candidates, (candidate) => {
      const PE = _.get(candidate['annual.EarningsPerShareDiluted'], 'fact.res');

      if(PE < 2 || PE > 15) {
        const ticker = _.get(candidate, 'ticker');
        delete candidates[ticker];
      }
    });

    return candidates;
  };

  const simulator = Simulation.create({
    timeline,
    findAllStates,
    strategies: {
      filterCandidatesForBuying,
    }
  });

  return {
    findAllStates,
    getMargins,
    simulate: (path) => simulator.simulate(path),
  };
};

const create = (stocks) => {

  return {
    getMetric: getMetric(stocks),

    findByFormat: findByFormat(stocks),
    findAllByFormat: findAllByFormat(stocks),

    getAllMetricByPrice: getAllMetricByPrice(stocks),

    getAllMetricMarginByPrice: getAllMetricMarginByPrice(stocks),
    getMetricMarginByPrice: getMetricMarginByPrice(stocks),

    getTickersWithEmptyHistoricals: () => getTickersWithEmptyHistoricals(stocks),
    getTimeline: () => getTimeline(stocks),
  };
};

module.exports = {
  create,
  createShareMarketTimeline,
};
