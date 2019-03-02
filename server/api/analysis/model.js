const _       = require('lodash');
const Stocks  = require('../stocks/model.js');

const growthRate = require('../../../lib/modules/timeseries/growthRate.js');

const getMetrics = (options) => {
  const instructions = {
    pipeline: [],
  };

  if(options.tickers) {
    const tickers = _.isArray(options.tickers) ? options.tickers : [options.tickers];

    instructions.pipeline.push({
      "$match": {
        "ticker": {
          "$in": tickers
        }
      }
    });
  }

  const projection = {
    "$project": {
      "ticker": 1,
    }
  };

  _.forEach(options.metrics, (path) => {
    projection['$project'][path] = 1;
  });

  instructions.pipeline.push(projection);

  return Stocks.aggregate(instructions);
};

const getEarnings = (tickers) => {
  const metrics = [
    "summary.annual.EarningsPerShareDiluted",
    "summary.annual.EarningsPerShareBasicAndDiluted",
  ];

  return getMetrics({ tickers, metrics })
    .then(data => _.map(data, prepareEarnings(metrics)))
};

const prepareEarnings = _.curry((metrics, data) => {
  const earnings = compromiseMetric(metrics, data);

  _.forEach(earnings, (earning, index) => {
    if(index === 0) {
      earning.growth = 0;
    } else {
      const previous = earnings[index-1].value;
      const current = earning.value;

      if(previous) {
        earning.growth = current/previous - 1;
      } else {
        earning.growth = 0;
      }
    }
  });


  return {
    ticker: _.get(data, 'ticker'),
    earnings,
  };
});

const compromiseMetric = _.curry((metrics, content) => {
  return _
    .chain(metrics)
    .map((metric) => {
      const value = _.get(content, metric);

      if(_.isArray(value) && value.length > 0) {
        return value;
      }
    })
    .sortBy('length')
    .first()
    .value();
});

module.exports = {
  getMetrics,

  getEarnings,
};
