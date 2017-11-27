const _             = require('lodash');
const fundamentals  = require('../../fundamentals/metrics');

const derive = (summary) => {
  setBookValuePerShare(summary);
  setDiscountCashflowIntrinsicValue(summary);

  return summary;
};

const setBookValuePerShare = (summary) => {
  const property = 'BookValuePerShare';

  const annual = fundamentals.getBookValuePerShare(_.get(summary, 'annual'));
  _.set(summary, `annual.Derived${property}`, annual);

  const quarterly = fundamentals.getBookValuePerShare(_.get(summary, 'quarterly'));
  _.set(summary, `quarterly.Derived${property}`, quarterly);

  return summary;
};

const setDiscountCashflowIntrinsicValue = (summary) => {
  const property = 'DCF_IntrinsicValue';

  const annual = fundamentals.getCashflowDiscountAsCollection(_.get(summary, 'annual'));
  _.set(summary, `annual.Derived${property}`, annual);

  const annualLimited = fundamentals.getCashflowDiscountAsCollection(_.get(summary, 'annual'), 0.2);
  _.set(summary, `annual.Derived${property}_MAX_GROWTH_RATE_20`, annualLimited);

  return summary;
};

module.exports = {
  derive,
  setBookValuePerShare,
  setDiscountCashflowIntrinsicValue,
}
