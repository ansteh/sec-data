const _ = require('lodash');

const getValues = (periods, dates) => {
  return _
    .chain(periods)
    .filter(({ endDate }) => {
      return _.includes(dates, endDate);
    })
    .value();
};

const getEarnings = (filings) => {
  const earningsPerShareDiluted = _.get(filings, 'EarningsPerShareDiluted');

  if(_.isArray(earningsPerShareDiluted) && earningsPerShareDiluted.length > 0) {
    return earningsPerShareDiluted;
  }

  const earningsPerShareBasicAndDiluted = _.get(filings, 'EarningsPerShareBasicAndDiluted');

  if(_.isArray(earningsPerShareBasicAndDiluted) && earningsPerShareBasicAndDiluted.length > 0) {
    return earningsPerShareBasicAndDiluted;
  }
};

const getTotalShares = (filings) => {
  const TotalShares = _.get(filings, 'WeightedAverageNumberOfDilutedSharesOutstanding');
  if(_.isArray(TotalShares) && TotalShares.length > 0) {
    return TotalShares;
  }

  const ShareOutstandingBasicAndDiluted = _.get(filings, 'WeightedAverageNumberOfShareOutstandingBasicAndDiluted');
  if(_.isArray(ShareOutstandingBasicAndDiluted) && ShareOutstandingBasicAndDiluted.length > 0) {
    return ShareOutstandingBasicAndDiluted;
  }

  return [];
};

module.exports = {
  getEarnings,
  getTotalShares,
  getValues,
};
