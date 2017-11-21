const _ = require('lodash');
const util = require('../util');

const { getTotalEquity } = require('./total-equity');

const getBookValuePerShare = (filings) => {
  const TotalEquity = getTotalEquity(filings);

  const TotalShares = _.get(filings, 'WeightedAverageNumberOfDilutedSharesOutstanding');
  const shares = util.getValues(TotalShares, _.map(TotalEquity, 'DocumentPeriodEndDate'));

  return _
    .chain(TotalEquity)
    .map(({ TotalEquity, DocumentPeriodEndDate }, index) => {
      const share = _.find(shares, { endDate: DocumentPeriodEndDate });

      if(_.has(share, 'value')) {
        const { value } = share;

        return {
          value: TotalEquity / value,
          endDate: DocumentPeriodEndDate
        };
      }
    })
    .filter(_.identity)
    .value();
};

module.exports = {
  getBookValuePerShare,
};
