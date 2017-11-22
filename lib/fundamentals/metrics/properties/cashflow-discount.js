const fundamentals = require('../fundamentals');
const DCF = require('../../formulas/discount-cashflow-model');

const _  = require('lodash');

const getCashflowDiscount = (filings) => {
  // const dividendsPerShare = _.get(filings, 'CommonStockDividendsPerShareDeclared');
  // console.log('dividendsPerShare', dividendsPerShare);
  //
  // const dividendsPerShareMean = _.mean(dividendsPerShare) || 0;
  // console.log('dividendsPerShareMean', dividendsPerShareMean);

  // const bookValuePerShare = _.get(filings, 'DerivedBookValuePerShare');
  // const bookValuePerShareGrowtRateMean = getMeanGrowthRate(bookValuePerShare);
  // console.log('bookValuePerShareGrowtRateMean', bookValuePerShareGrowtRateMean);

  const earningsPerShareDiluted = _.get(filings, 'EarningsPerShareDiluted');
  const earningsPerShareGrowtRateMean = getMeanGrowthRate(earningsPerShareDiluted);

  const growthRates = growthRate(_.map(earningsPerShareDiluted, 'value'));
  console.log('earningsPerShareDiluted', earningsPerShareDiluted);
  console.log('growthRates', growthRates);
  console.log('earningsPerShareGrowtRateMean', earningsPerShareGrowtRateMean);

  return DCF.getIntrinsicValue({
    currentEarnings: _.last(_.map(earningsPerShareDiluted, 'value')),
    growthRate: earningsPerShareGrowtRateMean,
    discountRate: 0.11,
    terminalRate: 0.03,
    years: 5,
  });
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
