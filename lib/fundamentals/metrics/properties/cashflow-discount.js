const fundamentals = require('../fundamentals');
const _  = require('lodash');

const getCashflowDiscount = (filings) => {
  const dividendsPerShare = _.get(filings, 'CommonStockDividendsPerShareDeclared');
  // console.log('dividendsPerShare', dividendsPerShare);

  const dividendsPerShareMean = _.mean(dividendsPerShare) || 0;
  console.log('dividendsPerShareMean', dividendsPerShareMean);

  const bookValuePerShare = _.get(filings, 'DerivedBookValuePerShare');
  const bookValuePerShareGrowtRateMean = getMeanGrowthRate(bookValuePerShare);
  console.log('bookValuePerShareGrowtRateMean', bookValuePerShareGrowtRateMean);

  const multiplier = Math.pow(1 + bookValuePerShareGrowtRateMean, 5);
  const dividenComponent = dividendsPerShare * (1 - 1/multiplier) / bookValuePerShareGrowtRateMean;
  const bookValueComponent = _.get(_.last(bookValuePerShare), 'value', 0) / multiplier;

  // console.log(_.get(_.last(bookValuePerShare), 'value', 0), multiplier);

  return dividenComponent + bookValueComponent;
};

const getMeanGrowthRate = (metric) => {
  const growthRates = growthRate(_.map(metric, 'value'));
  return _.mean(growthRates);
};

const growthRate = (collection) => {
  return _.reduce(collection, (rates, value, index) => {
    if(index > 0) {
      let previous = collection[index-1];
      rates.push(value/previous - 1);
    }
    return rates;
  }, []);
};

module.exports = {
  getCashflowDiscount,
};
