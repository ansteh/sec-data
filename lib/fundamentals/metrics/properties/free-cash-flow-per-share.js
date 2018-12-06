const _ = require('lodash');
const util = require('../util');

const { getFreeCashFlow } = require('./free-cash-flow');

const getFreeCashFlowPerShare = (filings) => {
  const FreeCashFlow = getFreeCashFlow(filings);
  const TotalShares = util.getTotalShares(filings);

  const shares = util.getValues(TotalShares, _.map(FreeCashFlow, 'endDate'));

  return _
    .chain(FreeCashFlow)
    .map(({ value, endDate }, index) => {
      const share = _.find(shares, { endDate });

      if(_.has(share, 'value')) {
        return {
          value: value / share.value,
          endDate
        };
      }
    })
    .filter(_.identity)
    .value();
};

module.exports = {
  getFreeCashFlowPerShare,
};
