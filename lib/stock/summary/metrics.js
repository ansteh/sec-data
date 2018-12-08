const _             = require('lodash');
const fundamentals  = require('../../fundamentals/metrics');

const derive = (summary) => {
  setBookValuePerShare(summary);
  setTrailingTwelveMonthsEarningsPerShareDiluted(summary);
  setDiscountCashflowIntrinsicValue(summary);
  setFreeCashFlow(summary);

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

  const annualByMean = fundamentals.getCashflowDiscountByMeanAsCollection(_.get(summary, 'annual'));
  _.set(summary, `annual.Derived${property}_BY_MEAN`, annualByMean);

  const annualByMeanLimited = fundamentals.getCashflowDiscountByMeanAsCollection(_.get(summary, 'annual'), 0.2);
  _.set(summary, `annual.Derived${property}_MAX_GROWTH_RATE_20_BY_MEAN`, annualByMeanLimited);

  const trailingDCF = fundamentals.getTrailingTwelveMonthsDiscountCashflowAsCollection(summary);
  _.set(summary, `quarterly.DerivedTrailingTwelveMonths${property}`, trailingDCF);

  const trailingDCFMaxRate20 = fundamentals.getTrailingTwelveMonthsDiscountCashflowAsCollection(summary, 0.2);
  _.set(summary, `quarterly.DerivedTrailingTwelveMonths${property}_MAX_GROWTH_RATE_20`, trailingDCFMaxRate20);

  return summary;
};

const setFreeCashFlow = (summary) => {
  const annualFreeCashFlow = fundamentals.getFreeCashFlow(_.get(summary, 'annual'));
  _.set(summary, `annual.FreeCashFlow`, annualFreeCashFlow);

  const annualFreeCashFlowPerShare = fundamentals.getFreeCashFlowPerShare(_.get(summary, 'annual'));
  _.set(summary, `annual.FreeCashFlowPerShare`, annualFreeCashFlowPerShare);

  const annual = fundamentals.getFreeCashFlowDiscountAsCollection(_.get(summary, 'annual'));
  _.set(summary, `annual.FreeCashFlow_IntrinsicValue`, annual);

  const annualByMean = fundamentals.getFreeCashFlowDiscountByMeanAsCollection(_.get(summary, 'annual'));
  _.set(summary, `annual.FreeCashFlow_IntrinsicValue_BY_MEAN`, annualByMean);

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
