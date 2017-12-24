const _             = require('lodash');
const fundamentals  = require('../../fundamentals/metrics');

const derive = (summary) => {
  setBookValuePerShare(summary);
  setTrailingTwelveMonthsEarningsPerShareDiluted(summary);
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

  const annualByMean = fundamentals.getCashflowDiscountAsCollectionByMean(_.get(summary, 'annual'));
  _.set(summary, `annual.Derived${property}_BY_MEAN`, annualByMean);

  const annualByMeanLimited = fundamentals.getCashflowDiscountAsCollectionByMean(_.get(summary, 'annual'), 0.2);
  _.set(summary, `annual.Derived${property}_MAX_GROWTH_RATE_20_BY_MEAN`, annualByMeanLimited);

  return summary;
};

const setTrailingTwelveMonthsEarningsPerShareDiluted = (summary) => {
  const property = 'TrailingTwelveMonthsEarningsPerShareDiluted';

  const quarterly = fundamentals.getTrailingTwelveMonthsEarningsPerShareDilutedAsCollection(_.get(summary, 'quarterly'));
  _.set(summary, `quarterly.Derived${property}`, quarterly);

  return summary;
};


module.exports = {
  derive,
  setBookValuePerShare,
  setDiscountCashflowIntrinsicValue,
}
