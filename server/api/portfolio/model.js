const _ = require('lodash');

const create = (positions) => {
  positions = setValuationProperties(positions);
  // positions = _.filter(positions, p => _.get(p, 'stock.margin'));

  const totalValue = getValue(positions);
  positions = setStakeWeightedProperties(positions, totalValue);
  const margin = getMargin(positions);

  const stake = _
    .chain(positions)
    .map('stake')
    .sum()
    .value();

  const PE = _.meanBy(positions, (position) => { return position.PE; });
  const PB = _.meanBy(positions, (position) => { return position.PB; });

  return {
    positions,
    value: totalValue,

    stake,
    margin,
    PE,
    PB,
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

const setStakeWeightedProperties = (positions, totalValue) => {
  return _.map(positions, (position) => {
    const value = position.currentValue || position.value || 0;

    position.stake = value / totalValue;

    const marginOfSafety = _.get(position, 'stock.margin') || 0;
    position.marginOfSafetyPortfolioWeight = position.stake * marginOfSafety;

    const PE = _.get(position, 'stock.PE') || 0;
    position.PE = position.stake * PE;

    const PB = _.get(position, 'stock.PB') || 0;
    position.PB = position.stake * PB;

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
