const _ = require('lodash');

const create = (positions) => {
  positions = setValuationProperties(positions);
  // positions = _.filter(positions, p => p.currentValue);

  const totalValue = getValue(positions);
  positions = setWeightedMarginOfSafety(positions, totalValue);
  const margin = getMargin(positions);

  return {
    positions,
    value: totalValue,
    margin,
  };
};

const setValuationProperties = (positions) => {
  return assignCurrentValue(positions);
};

const assignCurrentValue = (positions) => {
  return _.map(positions, (position) => {
    const price = _.get(position, 'stock.historicals.close');
    const amount = _.get(position, 'amount');

    position.currentValue = price * amount;

    return position;
  });
};

const getValue = (positions) => {
  return _.sumBy(positions, getCurrentValueBy);
};

const getCurrentValueBy = (position) => {
  if(isValidNumber(position.currentValue)) {
    return position.currentValue;
  }

  if(isValidNumber(position.value)) {
    return position.value;
  }

  return 0;
};

const isValidNumber = (value) => {
  return _.isNumber(value) && _.isNaN(value) === false;
};

const setWeightedMarginOfSafety = (positions, totalValue) => {
  return _.map(positions, (position) => {
    const value = position.currentValue || position.value || 0;

    position.stake = value / totalValue;

    const marginOfSafety = _.get(position, 'stock.margin') || 0;
    position.marginOfSafetyPortfolioWeight = position.stake * marginOfSafety;

    // console.log(position.ticker, position.stake, marginOfSafety, position.marginOfSafetyPortfolioWeight);

    return position;
  });
};

const getMargin = (positions) => {
  return _.meanBy(positions, (position) => {
    return position.marginOfSafetyPortfolioWeight;
  });
};

module.exports = {
  create,
};
