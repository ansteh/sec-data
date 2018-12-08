const _ = require('lodash');

const growthRate = require('./growthRate.js');

const getMeanGrowthRate = (values) => {
  if(!values || values.length < 2) {
    return 0;
  }

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

module.exports = {
  getMeanGrowthRate,
  getGrowthRateMomentums,
};
