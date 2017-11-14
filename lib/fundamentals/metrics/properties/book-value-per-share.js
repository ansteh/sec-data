const _ = require('lodash');
const util = require('../util');

const { getTotalEquity } = require('./total-equity');

const getBookValuePerShare = (filings) => {
  const TotalEquity = getTotalEquity(filings);

  const TotalShares = _.get(filings, 'WeightedAverageNumberOfDilutedSharesOutstanding');
  const shares = util.getValues(TotalShares, _.map(TotalEquity, 'DocumentPeriodEndDate'));

  return _.map(TotalEquity, ({ TotalEquity, DocumentPeriodEndDate }, index) => {
    const { value } = shares[index];

    return {
      value: TotalEquity / value,
      endDate: DocumentPeriodEndDate
    };
  });
};

module.exports = {
  getBookValuePerShare,
};
