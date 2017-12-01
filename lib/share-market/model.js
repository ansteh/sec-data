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

const getMetricMarginByPrice = _.curry((market, ticker, path) => {
  // const stock = _.get(market, ticker);
  const metric = getMetric(market, ticker, path);
  const dates = _.map(metric, 'endDate');
  const historical = findAllByFormat(market, ticker, dates);

  return _.reduce(metric, (margins, instance, index) => {
    const { value, endDate } = instance;
    const { close, date } = _.get(historical, index, { close: 0, date: endDate });
    const margin = (value - close)/value;

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
    getMetricMarginByPrice: getMetricMarginByPrice(market),
  };
};

module.exports = {
  create,
};
