const fundamentals = require('../fundamentals');
const DCF = require('../../formulas/discount-cashflow-model');

const _  = require('lodash');

const getMarginOfSafetyAsCollection = (filings, maxGrowthRate, prices) => {

};

const getCashflowDiscountAsCollection = (filings, maxGrowthRate) => {
  const earningsPerShareDiluted = _.get(filings, 'EarningsPerShareDiluted');

  const endDates = _
    .chain(earningsPerShareDiluted)
    .map('endDate')
    .tail()
    .value();

  return _.reduce(endDates, (valuations, endDate, index) => {
    const earnings = _.slice(earningsPerShareDiluted, 0, index+2);
    const value = getCashflowDiscountBy(earnings, maxGrowthRate);

    valuations.push({ value, endDate });

    return valuations;
  }, []);
};

const getCashflowDiscount = (filings, maxGrowthRate) => {
  const earningsPerShareDiluted = _.get(filings, 'EarningsPerShareDiluted');
  return getCashflowDiscountBy(earningsPerShareDiluted, maxGrowthRate);
};

const getCashflowDiscountBy = (earningsPerShareDiluted, maxGrowthRate) => {
  let earningsPerShareGrowtRateMean = getMeanGrowthRate(earningsPerShareDiluted);

  if(_.isUndefined(maxGrowthRate) === false) {
    earningsPerShareGrowtRateMean = _.min([earningsPerShareGrowtRateMean, maxGrowthRate]);
  }

  // const growthRates = growthRate(_.map(earningsPerShareDiluted, 'value'));
  // console.log('earningsPerShareDiluted', earningsPerShareDiluted);
  // console.log('growthRates', growthRates);
  // console.log('earningsPerShareGrowtRateMean', earningsPerShareGrowtRateMean);

  // const values = getValues(_.first(_.map(earningsPerShareDiluted, 'value')), growthRates);
  // console.log('values', values);

  return DCF.getIntrinsicValue({
    currentEarnings: _.last(_.map(earningsPerShareDiluted, 'value')),
    growthRate: earningsPerShareGrowtRateMean,
    discountRate: 0.11,
    terminalRate: 0.03,
    years: 5,
  });
};

const getMeanGrowthRate = (metric) => {
  const values = _.map(metric, 'value');
  const growthRates = growthRate(values);
  const momentums = getGrowthRateMomentums(values, growthRates);

  return _.mean(momentums);
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

const getValues = (initial, growthRates) => {
  let value = initial;

  return _.reduce(growthRates, (values, rate) => {
    value += value*rate;
    return [...values, value];
  }, [initial]);
};

const getGrowthRateMomentums = (values, growthRates) => {
  return _.reduce(growthRates, (momentums, rate, index) => {
    rate = Math.abs(rate);

    const previous = values[index];
    const value = values[index+1];

    momentums.push(previous <= value ? rate : -rate);

    return momentums;
  }, []);
};

module.exports = {
  getCashflowDiscount,
  getCashflowDiscountAsCollection,
};