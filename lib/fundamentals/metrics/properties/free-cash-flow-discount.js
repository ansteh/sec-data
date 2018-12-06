const Model = require('../../formulas/free-cash-flow-model');
const growthRate = require('../../../modules/timeseries/growthRate.js');

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

const getFreeCashFlowDiscountBy = (valuesPerShare, maxGrowthRate, pivotValue) => {
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
  if(!metric || metric.length < 2) {
    return 0;
  }

  const values = _.map(metric, 'value');
  const growthRates = growthRate(values);
  const momentums = getGrowthRateMomentums(values, growthRates);

  return _.mean(momentums);
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

const getFreeCashFlowDiscountAsCollection = (filings, maxGrowthRate) => {
  return getDiscountFreeCashFlowAsCollection(getFreeCashFlowDiscountBy, filings, maxGrowthRate)
};

module.exports = {
  getFreeCashFlowDiscountAsCollection,
};
