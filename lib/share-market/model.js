const _ = require('lodash');

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
      margin = (value - close)/value;
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

const create = (market) => {

  return {
    getMetric: getMetric(market),

    findByFormat: findByFormat(market),
    findAllByFormat: findAllByFormat(market),

    getAllMetricMarginByPrice: getAllMetricMarginByPrice(market),
    getMetricMarginByPrice: getMetricMarginByPrice(market),

    getTickersWithEmptyHistoricals: () => getTickersWithEmptyHistoricals(market),
  };
};

module.exports = {
  create,
};
