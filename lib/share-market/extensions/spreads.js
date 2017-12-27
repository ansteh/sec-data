const _ = require('lodash');
const moment = require('moment');

const spread = require('../../modules/timeseries/spread');

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
      annualGrowthRate: growthRate / days * 365,
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
      annualGrowthRate: growthRate / days * 365,
    };
  }
};

const getSpreadGrowthRatesBy = (stock) => {
  const info = {
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

module.exports = {
  getSpreadGrowthRatesBy,
}
