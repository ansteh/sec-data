const Model = require('../../formulas/free-cash-flow-model');
const growthRate = require('../../../modules/timeseries/growthRate.js');
const Growth = require('../../../modules/timeseries/growth.js');

const findSameOrBefore = require('../../../modules/timeseries/findSameOrBefore');
const take = require('../../../modules/timeseries/take');
const DATE_FORMAT = 'YYYY-MM-DD';

const _  = require('lodash');

const { getFreeCashFlowPerShare } = require('./free-cash-flow-per-share.js');

const getDiscountFreeCashFlowAsCollection = (getDFCF, filings, maxGrowthRate) => {
  const freeCashFlowPerShare = getFreeCashFlowPerShare(filings);

  const endDates = _
    .chain(freeCashFlowPerShare)
    .map('endDate')
    .tail()
    .value();

  return _.reduce(endDates, (valuations, endDate, index) => {
    const freeCashFlow = _.slice(freeCashFlowPerShare, 0, index+2);
    const value = getDFCF(freeCashFlow, maxGrowthRate);

    valuations.push({ value, endDate });

    return valuations;
  }, []);
};

const getFreeCashFlowDiscount = (valuesPerShare, maxGrowthRate, pivotValue) => {
  let valuesPerShareGrowtRateMean = getMeanGrowthRate(valuesPerShare);

  if(_.isUndefined(maxGrowthRate) === false) {
    valuesPerShareGrowtRateMean = _.min([valuesPerShareGrowtRateMean, maxGrowthRate]);
  }

  pivotValue = pivotValue || _.last(_.map(valuesPerShare, 'value'));

  return Model.getIntrinsicValue({
    value: pivotValue,
    growthRate: valuesPerShareGrowtRateMean,
    discountRate: 0.11,
    terminalRate: 0.03,
    years: 5,
  });
};

const getMeanGrowthRate = (metric) => {
  const values = _.map(metric, 'value');
  return Growth.getMeanGrowthRate(values);
};

const getFreeCashFlowDiscountAsCollection = (filings, maxGrowthRate) => {
  return getDiscountFreeCashFlowAsCollection(getFreeCashFlowDiscount, filings, maxGrowthRate)
};

const getFreeCashflowDiscountByMean = (valuesPerShare, maxGrowthRate) => {
  let valuesPerShareGrowtRateMean = getMeanGrowthRate(valuesPerShare);

  if(_.isUndefined(maxGrowthRate) === false) {
    valuesPerShareGrowtRateMean = _.min([valuesPerShareGrowtRateMean, maxGrowthRate]);
  }

  const values = _.map(valuesPerShare, 'value');

  return Model.getIntrinsicValue({
    value: _.mean(values),
    growthRate: valuesPerShareGrowtRateMean,
    discountRate: 0.11,
    terminalRate: 0.03,
    years: 5,
  });
};

const getFreeCashFlowDiscountByMeanAsCollection = (filings, maxGrowthRate) => {
  return getDiscountFreeCashFlowAsCollection(getFreeCashflowDiscountByMean, filings, maxGrowthRate)
};

// const getTrailingTwelveMonthsFreeCashFlowDiscount = (summary, date, maxGrowthRate) => {
//   const annual = _.get(summary, 'annual');
//   let valuesPerShare = getEarnings(annual);
//   valuesPerShare = take(valuesPerShare, 'endDate', date);
//
//   const quarterly = _.get(summary, 'quarterly');
//   const earnings = _.get(quarterly, 'DerivedTrailingTwelveMonthsEarningsPerShareDiluted');
//   let currentEarnings = findSameOrBefore(earnings, 'endDate', date);
//   currentEarnings = currentEarnings || _.last(valuesPerShare);
//   currentEarnings = _.get(currentEarnings, 'value');
//
//   return getFreeCashFlowDiscount(valuesPerShare, maxGrowthRate, currentEarnings);
// };

module.exports = {
  getFreeCashFlowDiscount,
  getFreeCashFlowDiscountAsCollection,

  getFreeCashflowDiscountByMean,
  getFreeCashFlowDiscountByMeanAsCollection,
};
