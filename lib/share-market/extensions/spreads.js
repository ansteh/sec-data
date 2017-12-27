const _ = require('lodash');
const moment = require('moment');

const spread = require('../../modules/timeseries/spread');

const getGrowthRate = (multiplier, start, end) => {
  if(start && end) {
    const pastDays = moment(end).diff(moment(start), 'days');
    return Math.pow(multiplier, 365/pastDays) - 1;
  }
};

const getSpreadBy = (stock) => {
  const prices = stock.historical.getData();
  return spread(prices, 'close');
};

const getTotalSpreadBy = (stock) => {
  const prices = stock.historical.getData();
  const start = _.first(prices);
  const end = _.last(prices);

  if(start) {
    const past = _.get(start, 'close');
    const present = _.get(end, 'close');

    const startDate = moment(_.get(start, 'date'));
    const endDate = moment(_.get(end, 'date'));
    const days = endDate.diff(startDate, 'days');

    const growthRate = present/past - 1;

    return {
      start,
      end,
      growthRate,
      days,
      annualGrowthRate: getGrowthRate(present/past, startDate, endDate),
    };
  }
}

const getSpreadGrowthRate = (spread) => {
  if(_.has(spread, 'min')) {
    const past = _.get(spread, 'min.close');
    const present = _.get(spread, 'max.close');

    const start = moment(_.get(spread, 'min.date'));
    const end = moment(_.get(spread, 'max.date'));
    const days = end.diff(start, 'days');

    const growthRate = present/past - 1;
    // console.log(days, growthRate);

    return {
      growthRate,
      days,
      annualGrowthRate: getGrowthRate(present/past, start, end),
    };
  }
};

const getSpreadGrowthRatesBy = (stock) => {
  const info = {
    ticker: stock.ticker,
    total: getTotalSpreadBy(stock),
  };

  const spread = getSpreadBy(stock);
  const growth = getSpreadGrowthRate(spread);
  if(growth) {
    _.assign(info, {
      optimal: _.assign({}, spread, growth)
    });
  }

  return info;
};

const getShareMarket = (spreads) => {
  const total = {};
  total.growthRate = _.mean(_.map(spreads, 'total.growthRate'));
  total.days = _.mean(_.map(spreads, 'total.days'));
  total.annualGrowthRate = _.mean(_.map(spreads, 'total.annualGrowthRate'));

  const optimal = {};
  optimal.growthRate = getPropertyBy(spreads, 'optimal.growthRate');
  optimal.days = getPropertyBy(spreads, 'optimal.days');
  optimal.annualGrowthRate = getPropertyBy(spreads, 'optimal.annualGrowthRate');

  // const outlier = _
  //   .chain(spreads)
  //   .filter(stock => {
  //     const x = _.get(stock, 'optimal.annualGrowthRate');
  //     // return _.get(spread, 'optimal.days', 0) > 7 && _.isNumber(x) && _.isNaN(x) === false && x > 1;
  //     return _.isNumber(x) && _.isNaN(x) === false && x > 1000;
  //   })
  //   .value();
  //
  // console.log(JSON.stringify(outlier, null, 2));

  return { total, optimal };
};

const getPropertyBy = (spreads, path) => {
  return _
    .chain(spreads)
    .filter((spread) => {
      return _.get(spread, 'optimal.days', 0) > 7;
    })
    .map(path)
    .filter(x => _.isNumber(x) && _.isNaN(x) === false)
    .mean()
    .value();
};

module.exports = {
  getGrowthRate,
  getShareMarket,
  getSpreadGrowthRatesBy,
}
