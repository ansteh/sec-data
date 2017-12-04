const _ = require('lodash');

const PriceModel = require('../stock/price/model.js');
const Simulation = require('./simulation.js');

const findAllByFormat = _.curry((market, ticker, dates) => {
  const stock = _.get(market, ticker);
  return stock.historical.findAllByFormat(dates);
});

const findByFormat = _.curry((market, ticker, date) => {
  const stock = _.get(market, ticker);
  return stock.historical.findByFormat(date);
});

const getMetric = _.curry((market, ticker, path) => {
  const stock = _.get(market, ticker);
  return _.get(stock, `summary.${path}`);
});

const getTickersWithEmptyHistoricals = (market) => {
  const tickers = [];

  _.forOwn(market, (stock, ticker) => {
    if(stock.historical.isEmpty()) {
      tickers.push(ticker);
    }
  });

  return tickers;
};

const getAllMetricMarginByPrice = _.curry((market, path) => {
  const margins = {};

  _.forOwn(market, (stock, ticker) => {
    margins[ticker] = getMetricMarginByPrice(market, ticker, path);
  });

  return margins;
});

const getMetricMarginByPrice = _.curry((market, ticker, path) => {
  const metric = getMetric(market, ticker, path);
  const dates = _.map(metric, 'endDate');
  const historical = findAllByFormat(market, ticker, dates);

  return _.reduce(metric, (margins, instance, index) => {
    const { value, endDate } = instance;
    const { close, date } = _.get(historical, index, { close: null, date: null });

    let margin = null;
    if(close) {
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

const getTimeline = (market) => {
  const stock = _.get(market, 'AAPL');
  const historicals = stock.historical.getData('2008-09-27');

  return _.map(historicals, (entry) => {
    return entry.date.substr(0, 10);
  });
};

const createShareMarketTimeline = (market, timeline, path) => {
  const scope = market.getAllMetricMarginByPrice(path);
  const tickers = _.keys(scope);

  const getClose = (ticker, date) => {
    const entry = market.findByFormat(ticker, date);
    return _.get(entry, 'close');
  };

  const findFact = (ticker, date) => {
    const facts = scope[ticker];

    const fact = PriceModel.matchByFormat(facts, 'endDate', date, 4);
    const entry = market.findByFormat(ticker, date);

    return { entry, fact };
  };

  const findAllStates = (date) => {
    return _.reduce(tickers, (states, ticker) => {
      const state = findFact(ticker, date);

      if(state.fact && state.entry) {
        const { value } = state.fact;
        const { close } = state.entry;
        state.margin = getMargin(value, close);
      }

      states[ticker] = state;

      return states;
    }, {});
  };

  const getMargins = (date) => {
    const states = findAllStates(date);
    return _.mapValues(states, 'margin');
  };

  const simulator = Simulation.create({
    timeline,
    findAllStates,
  });

  return {
    findAllStates,
    getMargins,
    simulate: () => simulator.simulate(),
  };
};

const create = (market) => {

  return {
    getMetric: getMetric(market),

    findByFormat: findByFormat(market),
    findAllByFormat: findAllByFormat(market),

    getAllMetricMarginByPrice: getAllMetricMarginByPrice(market),
    getMetricMarginByPrice: getMetricMarginByPrice(market),

    getTickersWithEmptyHistoricals: () => getTickersWithEmptyHistoricals(market),
    getTimeline: () => getTimeline(market)
  };
};

module.exports = {
  create,
  createShareMarketTimeline,
};
