const _ = require('lodash');
const moment = require('moment');

const findSameOrBefore = require('../../modules/timeseries/findSameOrBefore');

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

const getFundamentals = _.curry((stocks, ticker, path) => {
  const metric = getFundamentalMetric(stocks, ticker, path);
  const dates = _.map(metric, 'endDate');

  return metric;
});

const getFundamentalMetric = _.curry((stocks, ticker, path) => {
  const stock = _.get(stocks, ticker);
  const paths = path.split('.');

  const fundamentalMetricsPath = _.slice(paths, 0, paths.length-1).join('.');
  const property = _.last(paths);

  const periods = _.get(stock, `summary.${fundamentalMetricsPath}`);

  return _.map(periods, (period) => {
    return {
      endDate: _.get(period, 'DocumentPeriodEndDate'),
      value: _.get(period, property),
    };
  });
});

module.exports = {
  findAllByFormat,
  findByFormat,
  getMetric,

  getAllMetricMarginByPrice,
  getMetricMarginByPrice,
  getMargin,

  getAllMetricsBy,
  getMetricByPrice,

  getFundamentals,
  getFundamentalMetric,
};
