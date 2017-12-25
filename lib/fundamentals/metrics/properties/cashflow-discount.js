const fundamentals = require('../fundamentals');
const DCF = require('../../formulas/discount-cashflow-model');
const growthRate = require('../../../modules/timeseries/growthRate.js');

const findSameOrBefore = require('../../../modules/timeseries/findSameOrBefore');
const take = require('../../../modules/timeseries/take');
const DATE_FORMAT = 'YYYY-MM-DD';

const _  = require('lodash');

const getDiscountCashflowAsCollection = (getDCF, filings, maxGrowthRate) => {
  const earningsPerShareDiluted = _.get(filings, 'EarningsPerShareDiluted');

  const endDates = _
    .chain(earningsPerShareDiluted)
    .map('endDate')
    .tail()
    .value();

  return _.reduce(endDates, (valuations, endDate, index) => {
    const earnings = _.slice(earningsPerShareDiluted, 0, index+2);
    const value = getDCF(earnings, maxGrowthRate);

    valuations.push({ value, endDate });

    return valuations;
  }, []);
};

const getCashflowDiscount = (filings, maxGrowthRate) => {
  const earningsPerShareDiluted = _.get(filings, 'EarningsPerShareDiluted');
  return getCashflowDiscountBy(earningsPerShareDiluted, maxGrowthRate);
};

const getCashflowDiscountBy = (earningsPerShareDiluted, maxGrowthRate, currentEarnings) => {
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

  currentEarnings = currentEarnings || _.last(_.map(earningsPerShareDiluted, 'value'));

  return DCF.getIntrinsicValue({
    currentEarnings,
    growthRate: earningsPerShareGrowtRateMean,
    discountRate: 0.11,
    terminalRate: 0.03,
    years: 5,
  });
};

const getCashflowDiscountByMean = (earningsPerShareDiluted, maxGrowthRate) => {
  let earningsPerShareGrowtRateMean = getMeanGrowthRate(earningsPerShareDiluted);

  if(_.isUndefined(maxGrowthRate) === false) {
    earningsPerShareGrowtRateMean = _.min([earningsPerShareGrowtRateMean, maxGrowthRate]);
  }

  // console.log('earningsPerShareDiluted', _.map(earningsPerShareDiluted, 'value'));
  // console.log('last', _.last(_.map(earningsPerShareDiluted, 'value')));
  // console.log('mean', _.mean(_.map(earningsPerShareDiluted, 'value')));
  // console.log('rate', earningsPerShareGrowtRateMean);
  //
  // console.log('DCF.getIntrinsicValue mean', DCF.getIntrinsicValue({
  //   currentEarnings: _.mean(_.map(earningsPerShareDiluted, 'value')),
  //   growthRate: earningsPerShareGrowtRateMean,
  //   discountRate: 0.11,
  //   terminalRate: 0.03,
  //   years: 5,
  // }));
  //
  // console.log('DCF.getIntrinsicValue last', DCF.getIntrinsicValue({
  //   currentEarnings: _.last(_.map(earningsPerShareDiluted, 'value')),
  //   growthRate: earningsPerShareGrowtRateMean,
  //   discountRate: 0.11,
  //   terminalRate: 0.03,
  //   years: 5,
  // }));
  //
  // console.log();

  const values = _.map(earningsPerShareDiluted, 'value');

  return DCF.getIntrinsicValue({
    currentEarnings: _.mean(values),
    growthRate: earningsPerShareGrowtRateMean,
    discountRate: 0.11,
    terminalRate: 0.03,
    years: 5,
  });
};

const getMeanGrowthRate = (metric) => {
  if(!metric || metric.length < 2) {
    return 0;
  }

  const values = _.map(metric, 'value');
  const growthRates = growthRate(values);
  const momentums = getGrowthRateMomentums(values, growthRates);

  return _.mean(momentums);
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

const getCashflowDiscountAsCollection = (filings, maxGrowthRate) => {
  return getDiscountCashflowAsCollection(getCashflowDiscountBy, filings, maxGrowthRate)
};

const getCashflowDiscountAsCollectionByMean = (filings, maxGrowthRate) => {
  return getDiscountCashflowAsCollection(getCashflowDiscountByMean, filings, maxGrowthRate)
};

const getTrailingTwelveMonthsDiscountCashflow = (summary, date, maxGrowthRate) => {
  const annual = _.get(summary, 'annual');
  let earningsPerShareDiluted = _.get(annual, 'EarningsPerShareDiluted');
  earningsPerShareDiluted = take(earningsPerShareDiluted, 'endDate', date);
  // console.log('annual earnings', earningsPerShareDiluted, date);

  const quarterly = _.get(summary, 'quarterly');
  const earnings = _.get(quarterly, 'DerivedTrailingTwelveMonthsEarningsPerShareDiluted');
  let currentEarnings = findSameOrBefore(earnings, 'endDate', date);
  currentEarnings = currentEarnings || _.last(earningsPerShareDiluted);
  currentEarnings = _.get(currentEarnings, 'value');
  // console.log('trailing earnings', currentEarnings, date);
  // console.log('DCF', getCashflowDiscountBy(earningsPerShareDiluted, maxGrowthRate, currentEarnings));

  return getCashflowDiscountBy(earningsPerShareDiluted, maxGrowthRate, currentEarnings);
};

const getTrailingTwelveMonthsDiscountCashflowAsCollection = (summary, maxGrowthRate) => {
  const quarterly = _.get(summary, 'quarterly');
  const earningsPerShareDiluted = _.get(quarterly, 'EarningsPerShareDiluted');

  const endDates = _
    .chain(earningsPerShareDiluted)
    .map('endDate')
    .tail()
    .value();

  return _
    .chain(endDates)
    .map((endDate) => {
      return {
        endDate,
        value: getTrailingTwelveMonthsDiscountCashflow(summary, endDate, maxGrowthRate)
      }
    })
    .filter(item => _.isNumber(item.value) && !_.isNaN(item.value))
    .value();
};

module.exports = {
  getCashflowDiscount,
  getCashflowDiscountAsCollection,

  getCashflowDiscountByMean,
  getCashflowDiscountAsCollectionByMean,

  getTrailingTwelveMonthsDiscountCashflow,
  getTrailingTwelveMonthsDiscountCashflowAsCollection,
};
